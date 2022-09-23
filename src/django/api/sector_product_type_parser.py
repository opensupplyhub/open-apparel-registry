from datetime import datetime, timedelta
from api.models import Sector
from api.constants import CsvHeaderField


class SectorCache:
    REFRESH_INTERVAL = timedelta(seconds=300)

    def __init__(self) -> None:
        self.map = None

    def refetch_sectors(self):
        self.map = {
            sector.name.lower(): sector.name
            for sector in Sector.objects.all()
        }
        self.fetch_time = datetime.now()

    def refresh_if_needed(self):
        if self.map is None or (
            datetime.now() > self.fetch_time + SectorCache.REFRESH_INTERVAL
        ):
            self.refetch_sectors()

    @property
    def sector_map(self):
        self.refresh_if_needed()
        return self.map


class SectorProductTypeParser:
    sector_cache = SectorCache()

    def __init__(self):
        self.sectors = []
        self.product_types = []

    def parse_all_values(self, all_values):
        sector_map = SectorProductTypeParser.sector_cache.sector_map

        for value in all_values:
            clean_value = self.clean_value(value)
            if (clean_value in sector_map):
                self.sectors.append(sector_map[clean_value])
            else:
                self.product_types.append(value)

        if len(self.sectors) == 0:
            self.sectors.append(Sector.DEFAULT_SECTOR_NAME)

    def sort_values(self):
        self.sectors.sort()
        self.product_types.sort()

    def clean_value(self, value):
        return value.lower().strip()


class RequestBodySectorProductTypeParser(SectorProductTypeParser):
    def __init__(self, body):
        super().__init__()

        self.parse_all_values(
            set([
                *body.get('sector', []),
                *body.get('product_type', []),
                *body.get('sector_product_type', [])
            ])
        )

        self.sort_values()


class CsvRowSectorProductTypeParser(SectorProductTypeParser):
    csv_fields = [
        CsvHeaderField.SECTOR,
        CsvHeaderField.PRODUCT_TYPE,
        CsvHeaderField.SECTOR_PRODUCT_TYPE
    ]

    def __init__(self, fields, values):
        super().__init__()

        all_values = set()
        for field in CsvRowSectorProductTypeParser.csv_fields:
            if field in fields:
                value_string = values[fields.index(field)]
                for value in value_string.split("|"):
                    all_values.add(value)

        self.parse_all_values(all_values)
        self.sort_values()
