import itertools
import sqlite3
import dedupe
from dedupe.api import Link, GazetteerMatching
from dedupe._typing import Data, Blocks
from django.db import connection, transaction


class OgrGazetteerMatching(GazetteerMatching):
    def index(self, data: Data) -> None:  # pragma: no cover
        """
        Add records to the index of records to match against. If a record in
        `canonical_data` has the same key as a previously indexed record, the
        old record will be replaced.
        Args:
            data: a dictionary of records where the keys
                  are record_ids and the values are
                  dictionaries with the keys being
                  field_names
        """

        self.fingerprinter.index_all(data)

        id_type = dedupe.core.sqlite_id_type(data)

        con = sqlite3.connect(self.db)

        # Set journal mode to WAL.
        con.execute('pragma journal_mode=wal')

        con.execute('''CREATE TABLE IF NOT EXISTS indexed_records
                       (block_key text,
                        record_id {id_type},
                        UNIQUE(block_key, record_id))
                    '''.format(id_type=id_type))


        ## NEW DB CODE
        # TODO: Should this be a model?
        with connection.cursor() as cursor:
            cursor.execute(
                """CREATE TABLE IF NOT EXISTS dedupe_indexed_records
                (block_key text,
                record_id varchar(32),
                UNIQUE (block_key, record_id))
                """
            )

        con.executemany("REPLACE INTO indexed_records VALUES (?, ?)",
                        self.fingerprinter(data.items(), target=True))

        ## NEW DB CODE
        # TODO: Do this in chunks rather than one at a time
        # Can you bulk copy with upsert logic?
        # The dedupee PG example has a bulk insert but this may not do an update
        # https://github.com/dedupeio/dedupe-examples/blob/a767fa5a127bd56afc574c66895bb9b783152e04/pgsql_big_dedupe_example/pgsql_big_dedupe_example.py#L301-L306
        #
        # This SO answer has a "bulk upsert with lock" section that looks
        # promising, if we can use `COPY` to get the data into a temp table and
        # then upsert to our indexed records
        # https://stackoverflow.com/a/17267423
        #
        # Ther SO answwer shows using a JSON array
        # https://stackoverflow.com/a/41022458
        with connection.cursor() as cursor:
            for item in self.fingerprinter(data.items(), target=True):
                cursor.execute(
                    """
                    INSERT INTO dedupe_indexed_records (block_key, record_id)
                    VALUES (%s, %s)
                    ON CONFLICT (block_key, record_id) DO NOTHING
                    """, item
                )


        con.execute('''CREATE INDEX IF NOT EXISTS
                       indexed_records_block_key_idx
                       ON indexed_records
                       (block_key, record_id)''')
        con.execute('''ANALYZE''')

        ## NEW DB CODE
        with connection.cursor() as cursor:
            cursor.execute(
                    """
                    CREATE INDEX IF NOT EXISTS
                    dedupe_indexed_records_idx
                    ON dedupe_indexed_records (block_key, record_id)
                    """
                )


        con.commit()
        con.close()

        self.indexed_data.update(data)

    def unindex(self, data: Data) -> None:  # pragma: no cover
        """
        Remove records from the index of records to match against.
        Args:
            data: a dictionary of records where the keys
                  are record_ids and the values are
                  dictionaries with the keys being
                  field_names
        """

        for field in self.fingerprinter.index_fields:
            self.fingerprinter.unindex({record[field]
                                        for record
                                        in data.values()},
                                       field)

        con = sqlite3.connect(self.db)
        con.executemany('''DELETE FROM indexed_records
                           WHERE record_id = ?''',
                        ((k, ) for k in data.keys()))

        ## NEW DB CODE
        # TODO: Delete in batches?
        with connection.cursor() as cursor:
            for k in data.keys():
                cursor.execute(
                    """
                    DELETE FROM dedupe_indexed_records
                    WHERE record_id = %s
                    """, k
                )

        con.commit()
        con.close()

        for k in data:
            del self.indexed_data[k]

    def blocks(self, data: Data) -> Blocks:
        """
        Yield groups of pairs of records that share fingerprints.
        Each group contains one record from data_1 paired with the records
        from the indexed records that data_1 shares a fingerprint with.
        Each pair within and among blocks will occur at most once. If
        you override this method, you need to take care to ensure that
        this remains true, as downstream methods, particularly
        :func:`many_to_n`, assumes that every pair of records is compared no
        more than once.
        Args:
            data: Dictionary of records, where the keys are record_ids
                  and the values are dictionaries with the keys being
                  field names
        .. code:: python
            > pairs = matcher.pairs(data)
            > print(list(pairs))
            [[((1, {'name' : 'Pat', 'address' : '123 Main'}),
               (8, {'name' : 'Pat', 'address' : '123 Main'})),
              ((1, {'name' : 'Pat', 'address' : '123 Main'}),
               (9, {'name' : 'Sam', 'address' : '123 Main'}))
              ],
             [((2, {'name' : 'Sam', 'address' : '2600 State'}),
               (5, {'name' : 'Pam', 'address' : '2600 Stat'})),
              ((2, {'name' : 'Sam', 'address' : '123 State'}),
               (7, {'name' : 'Sammy', 'address' : '123 Main'}))
             ]]
        """

        # id_type = dedupe.core.sqlite_id_type(data)

        # con = sqlite3.connect(self.db, check_same_thread=False)

        # con.execute('BEGIN')

        # con.execute('''CREATE TEMPORARY TABLE blocking_map
        #                (block_key text, record_id {id_type})
        #             '''.format(id_type=id_type))
        # con.executemany("INSERT INTO blocking_map VALUES (?, ?)",
        #                 self.fingerprinter(data.items()))


        #https://thebuild.com/blog/2010/12/14/using-server-side-postgresql-cursors-in-django/
        # This is required to populate the connection object properly
        # if connection.connection is None:
        #     cursor = connection.cursor()

        with connection.cursor() as cursor:
            cursor.execute(
                """CREATE TEMP TABLE dedupe_blocking_map
                (block_key text,
                record_id varchar(32))
                """
            )
            # TODO: Insert in bulk/batcehs?
            for item in self.fingerprinter(data.items()):
                cursor.execute("""
                INSERT INTO dedupe_blocking_map (block_key, record_id) VALUES
                (%s, %s)
                """, item)

            cursor.execute('''SELECT DISTINCT a.record_id, b.record_id
                               FROM dedupe_blocking_map a
                               INNER JOIN dedupe_indexed_records b
                               USING (block_key)
                               ORDER BY a.record_id''')

            # https://code.activestate.com/recipes/137270-use-generators-for-fetching-large-db-record-sets/
            def ResultIter(c, arraysize=1000):
                'An iterator that uses fetchmany to keep memory usage down'
                while True:
                    results = c.fetchmany(arraysize)
                    if not results:
                        break
                    for result in results:
                        yield result

            db_pair_blocks = itertools.groupby(ResultIter(cursor), lambda x: x[0])
            for _, pair_block in db_pair_blocks:
                yield [((a_record_id, data[a_record_id]),
                        (b_record_id, self.indexed_data[b_record_id]))
                       for a_record_id, b_record_id
                       in pair_block]

        # pairs = con.execute('''SELECT DISTINCT a.record_id, b.record_id
        #                        FROM blocking_map a
        #                        INNER JOIN indexed_records b
        #                        USING (block_key)
        #                        ORDER BY a.record_id''')

        # pair_blocks = itertools.groupby(pairs,
        #                                 lambda x: x[0])

        # for _, pair_block in pair_blocks:

        #     yield [((a_record_id, data[a_record_id]),
        #             (b_record_id, self.indexed_data[b_record_id]))
        #            for a_record_id, b_record_id
        #            in pair_block]

        # pairs.close()
        # con.execute("ROLLBACK")
        # con.close()


class OgrGazetteer(Link, OgrGazetteerMatching):
    pass
