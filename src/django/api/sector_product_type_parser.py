from api.models import Sector
from api.constants import CsvHeaderField


class SectorProductTypeParser:
    sector_names = [sector.name for sector in Sector.objects.all()]
    lower_case_sector_names = [name.lower() for name in sector_names]

    csv_fields = [
        CsvHeaderField.SECTOR,
        CsvHeaderField.PRODUCT_TYPE,
        CsvHeaderField.SECTOR_PRODUCT_TYPE
    ]

    def __init__(self):
        self.sectors = []
        self.product_types = []

    def parse_all_values(self, all_values):
        for value in all_values:
            try:
                index = SectorProductTypeParser.lower_case_sector_names.index(
                    value.lower().strip()
                )
                self.sectors.append(
                    SectorProductTypeParser.sector_names[index])
            except ValueError:
                self.product_types.append(value)

        if len(self.sectors) == 0:
            self.sectors.append(Sector.DEFAULT_SECTOR_NAME)

    def sort_values(self):
        self.sectors.sort()
        self.product_types.sort()


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
    def __init__(self, fields, values):
        super().__init__()

        all_values = set()
        for field in SectorProductTypeParser.csv_fields:
            if field in fields:
                value_string = values[fields.index(field)]
                for value in value_string.split("|"):
                    all_values.add(value)

        print('all values')
        print(all_values)

        self.parse_all_values(all_values)
        self.sort_values()
