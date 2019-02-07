import csv
import sys

from os import listdir
from os.path import isfile, join

COUNTRY_CODES = {
    'ALBANIA': 'AL',
    'ARGENTINA': 'AR',
    'AUSTRALIA': 'AU',
    'AUSTRIA': 'AT',
    'BAHRAIN': 'BH',
    'BANGLADESH': 'BD',
    'BELARUS': 'BY',
    'BELGIUM': 'BE',
    'BOSNIA': 'BA',
    'BOSNIA AND HERZEGOVINA': 'BA',
    'BRAZIL': 'BR',
    'BULGARIA': 'BG',
    'CAMBODIA': 'KH',
    'CANADA': 'CA',
    'CAMEROON': 'CM',
    'CHILE': 'CL',
    'COLOMBIA': 'CO',
    'COSTA RICA': 'CR',
    'CHINA': 'CN',
    'CROATIA': 'HR',
    'CZECH REPUBLIC': 'CZ',
    'DENMARK': 'DK',
    'DOMINICAN REPUBLIC': 'DO',
    'DOMINICAN REP': 'DO',
    'ECUADOR': 'EC',
    'EGYPT': 'EG',
    'ESTONIA': 'EE',
    'ETHIOPIA': 'ET',
    'EL SALVADOR': 'SV',
    'FINLAND': 'FI',
    'FRANCE': 'FR',
    'GEORGIA': 'GE',
    'GERMANY': 'DE',
    'GREAT BRITAIN': 'GB',
    'GREECE': 'GR',
    'GUATEMALA': 'GT',
    'HAITI': 'HT',
    'HONDURAS': 'HN',
    'HONG KONG': 'HK',
    'HUNGARY': 'HU',
    'INDIA': 'IN',
    'INDONESIA': 'ID',
    'ISRAEL': 'IL',
    'ITALY': 'IT',
    'JAPAN': 'JP',
    'JORDAN': 'JO',
    'KENYA': 'KE',
    'KOREA, REPUBLIC OF (SOUTH KOREA)': 'KO',
    'LAOS': 'LA',
    'LATVIA': 'LV',
    'LEBANON': 'LB',
    'LESOTHO': 'LS',
    'LITHUANIA': 'LT',
    'LUXEMBOURG': 'LU',
    'MACEDONIA': 'MK',
    'MADAGASCAR': 'MG',
    'MALAYSIA': 'MY',
    'MAURITIUS': 'MU',
    'MEXICO': 'MX',
    'MOLDOVA': 'MD',
    'MOLDOVA, REPUBLIC OF': 'MD',
    'MONACO': 'MC',
    'MOROCCO': 'MA',
    'MYANMAR': 'MM',
    'MYANMAR (BURMA)': 'MM',
    'NEPAL': 'NP',
    'NETHERLANDS': 'NL',
    'NEW ZEALAND': 'NZ',
    'NICARAGUA': 'NI',
    'NORWAY': 'NO',
    'PAKISTAN': 'PK',
    'PARAGUAY': 'PY',
    'PERU': 'PE',
    'PHILIPPINES': 'PH',
    'POLAND': 'PL',
    'PORTUGAL': 'PT',
    'PUERTO RICO': 'PR',
    'ROMANIA': 'RO',
    'RUSSIA': 'RU',
    'SERBIA': 'RS',
    'SINGAPORE': 'SG',
    'SLOVAK REPUBLIC': 'SK',
    'SLOVAKIA': 'SK',
    'SLOVENIA': 'SI',
    'SOUTH AFRICA': 'ZA',
    'SOUTH KOREA': 'KO',
    'SPAIN': 'ES',
    'SRI LANKA': 'LK',
    'SWEDEN': 'SE',
    'SYRIAN ARAB REPUBLIC': 'SY',
    'TAIWAN': 'TW',
    'TANZANIA': 'TZ',
    'THAILAND': 'TH',
    'TUNISIA': 'TN',
    'TURKEY': 'TR',
    'UAE': 'AE',
    'UK': 'GB',
    'UKRAINE': 'UA',
    'UNITED ARAB EMIRATES': 'AE',
    'UNITED ARAB EMIRATES UAE': 'AE',
    'UNITED KINGDOM': 'GB',
    'UNITED STATES': 'US',
    'US': 'US',
    'USA': 'US',
    'VIETNAM': 'VN',
    'VIETNAME': 'VN',
}


def main():
    source_dir = sys.argv[1]
    output_file = sys.argv[2]
    with open(output_file, 'w') as output_file:
        files = [join(source_dir, f) for f in listdir(source_dir) if isfile(join(source_dir, f))]
        writer = csv.DictWriter(output_file, ['id', 'country', 'name', 'address'])
        writer.writeheader()
        id = 1
        for f in files:
            print(f)
            with open(f, 'r') as csv_file:
                for row in csv.DictReader(csv_file):
                    writer.writerow({
                        'id': id,
                        'country': COUNTRY_CODES[row['country'].upper().strip()],
                        'name': row['name'],
                        'address': row['address'],
                    })
                    id += 1

if __name__ == '__main__':
    main()
