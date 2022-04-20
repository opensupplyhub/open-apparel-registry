import sqlite3
import dedupe
from dedupe.api import Link, GazetteerMatching
from dedupe._typing import Data
from django.db import connection


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


class OgrGazetteer(Link, OgrGazetteerMatching):
    pass
