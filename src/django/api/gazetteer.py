from django.utils import timezone
import logging
import itertools
import json
from dedupe.api import Link, GazetteerMatching, StaticMatching
from dedupe._typing import Data, Blocks
from django.db import connection
from api.models import TrainedModel


logger = logging.getLogger(__name__)


class ModelOutOfDate(Exception):
    pass


class OgrGazetteerMatching(GazetteerMatching):
    def check_model_version(self):
        if TrainedModel.objects.get_active_version_id() \
           != self.trained_model.id:
            raise ModelOutOfDate()

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

        self.check_model_version()

        self.fingerprinter.index_all(data)

        # TODO: Do this in chunks rather than one at a time. Can you bulk copy
        # with upsert logic? The dedupe PG example has a bulk insert but this
        # may not do an update
        # https://github.com/dedupeio/dedupe-examples/blob/a767fa5a127bd56afc574c66895bb9b783152e04/pgsql_big_dedupe_example/pgsql_big_dedupe_example.py#L301-L306
        #
        # This SO answer has a "bulk upsert with lock" section that looks
        # promising, if we can use `COPY` to get the data into a temp table and
        # then upsert to our indexed records
        # https://stackoverflow.com/a/17267423
        #
        # The SO answer shows using a JSON array
        # https://stackoverflow.com/a/41022458

        with connection.cursor() as cursor:
            for item in self.fingerprinter(data.items(), target=True):
                cursor.execute(
                    """
                    INSERT INTO dedupe_indexed_records (block_key,
                                                            record_id,
                                                            record_data)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (block_key, record_id)
                    DO UPDATE SET record_data = EXCLUDED.record_data
                    """,
                    [item[0], item[1], json.dumps(data[item[1]])],
                )

    def unindex(self, data: Data) -> None:  # pragma: no cover
        """
        Remove records from the index of records to match against.
        Args:
            data: a dictionary of records where the keys
                  are record_ids and the values are
                  dictionaries with the keys being
                  field_names
        """

        self.check_model_version()

        # TODO can remove because we are not using index predicates
        for field in self.fingerprinter.index_fields:
            self.fingerprinter.unindex(
                {record[field] for record in data.values()}, field
            )

        # TODO: Delete in batches?
        with connection.cursor() as cursor:
            for k in data.keys():
                cursor.execute(
                    """
                    DELETE FROM dedupe_indexed_records
                    WHERE record_id = %s
                    """,
                    [k],
                )

    def blocks(self, data: Data) -> Blocks:
        logger.info(' IN BLOCKS {}'.format(timezone.now()))
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

        self.check_model_version()

        with connection.cursor() as cursor:
            cursor.execute("DROP TABLE IF EXISTS dedupe_blocking_map")
            cursor.execute(
                """CREATE TEMP TABLE dedupe_blocking_map
                (block_key text,
                record_id varchar(32))
                """
            )
            # TODO: Insert in bulk/batches?
            for item in self.fingerprinter(data.items()):
                cursor.execute(
                    """
                INSERT INTO dedupe_blocking_map (block_key, record_id) VALUES
                (%s, %s)
                """,
                    item,
                )

            cursor.execute(
                """SELECT DISTINCT a.record_id, b.record_id, b.record_data
                               FROM dedupe_blocking_map a
                               INNER JOIN dedupe_indexed_records b
                               USING (block_key)
                               ORDER BY a.record_id"""
            )

            # https://code.activestate.com/recipes/137270-use-generators-for-fetching-large-db-record-sets/
            def ResultIter(c, arraysize=1000):
                'An iterator that uses fetchmany to keep memory usage down'
                while True:
                    results = c.fetchmany(arraysize)
                    if not results:
                        break
                    for result in results:
                        yield result

            # TODO server-side cursor could trade performance for lower
            # memory footprint (would eliminate the need for ResultIter)
            db_pair_blocks = itertools.groupby(ResultIter(cursor),
                                               lambda x: x[0])
            for _, pair_block in db_pair_blocks:
                logger.info('YIELDING BLOCK {}'.format(timezone.now()))
                yield [
                    (
                        (a_record_id, data[a_record_id]),
                        (b_record_id, json.loads(b_record_data)),
                    )
                    for a_record_id, b_record_id, b_record_data in pair_block
                ]
        logger.info('OUT BLOCKS {}'.format(timezone.now()))


class OgrStaticGazetteer(StaticMatching, OgrGazetteerMatching):
    pass


class OgrGazetteer(Link, OgrGazetteerMatching):
    def build_index_table(self, canonical):
        table_name = 'dedupe_indexed_records_{}'.format(self.trained_model.id)

        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS {table_name}
                    (id SERIAL PRIMARY KEY,
                    block_key text NOT NULL,
                    record_id varchar(32) NOT NULL,
                    record_data text NOT NULL,
                    UNIQUE (block_key, record_id));
                CREATE INDEX {table_name}_idx
                ON {table_name} (block_key, record_id);
                """
                .format(table_name=table_name)
            )
            # TODO: Bulk insert for speed?
            # The `target` kwarg is related to index predicates, which we are
            # not using.
            for item in self.fingerprinter(canonical.items(), target=True):
                cursor.execute(
                    """
                    INSERT INTO {} (block_key, record_id, record_data)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (block_key, record_id)
                    DO UPDATE SET record_data = EXCLUDED.record_data
                    """.format(table_name),
                    [item[0], item[1], json.dumps(canonical[item[1]])],
                )
