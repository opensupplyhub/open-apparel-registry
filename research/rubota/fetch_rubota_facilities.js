/*

 This is based on /restify/scripts/fetch_from_rubota.js with the following
 modifications:

 - Switches to https for API requests to avoid 405 errors.
 - Switches to `require` syntax for loading libraries.
 - Only writes out the country, name, and address to the CSV.
 - Made formatting changes suggested by eslint.
 - Renamed factory to facility.

*/

var axios = require('axios');
var csv = require('fast-csv');
var fs = require('fs');

const countries = [
    'China',
    'Bangladesh',
    'United States',
    'India',
    'Japan',
    'Brazil',
    'Vietnam',
    'United Kingdom',
    'Turkey',
    'France',
    'Italy',
    'Indonesia',
    'Cambodia',
    'Mexico',
    'South Korea',
    'Hong Kong',
    'Taiwan',
    'Sri Lanka',
    'Germany',
    'Pakistan',
    'Portugal',
    'Canada',
    'Spain',
    'Thailand',
    'Romania',
    'Tunisia',
    'Australia',
    'Poland',
    'Myanmar (Burma)',
    'Netherlands',
    'Belgium',
    'Argentina',
    'El Salvador',
    'Honduras',
    'Philippines',
    'Bulgaria',
    'Egypt',
    'Guatemala',
    'Singapore',
    'Malaysia',
    'Colombia',
    'Chile',
    'Czech Republic',
    'Sweden',
    'Jordan',
    'Dominican Republic',
    'South Africa',
    'Croatia',
    'Switzerland',
    'Nicaragua',
    'Russia',
    'Serbia',
    'Hungary',
    'Ireland',
    'Morocco',
    'Denmark',
    'Austria',
    'Greece',
    'Macedonia (FYROM)',
    'Slovenia',
    'Kenya',
    'New Zealand',
    'Ukraine',
    'Haiti',
    'Peru',
    'Ethiopia',
    'Israel',
    'Madagascar',
    'Mauritius',
    'Slovakia',
    'Costa Rica',
    'Lithuania',
    'Macedonia',
    'Bosnia and Herzegovina',
    'Ecuador',
    'Georgia',
    'Albania',
    'Moldova',
    'Macau',
    'Moldova, Republic Of',
    'Norway',
    'Estonia',
    'Lesotho',
    'Luxembourg',
    'United Arab Emirates',
    'Belarus',
    'Cyprus',
    'Czechia',
    'Finland',
    'Laos',
    'Paraguay',
    'Thaﬂand',
    'Uruguay',
    'Barbados',
    'Bolivia',
    'Brunei',
    'Indonega',
    'Jersey',
    'Korea',
    'Latvia',
    'Lebanon',
    'Maldives',
    'Nicaragura',
    'Puerto Rico',
    'Qatar',
    'Scotland',
    'Tanzania, United Republic Of',
    'indonega',
    'indonesia'
];

let facilities = [];

Promise.all(countries.map(async country => {
    return axios({
        method: 'POST',
        url: 'https://suppliers.rubota.com/api/search',
        data: {
            search_page_from: 0,
            search_page_size: 10000,
            display_page_from: 0,
            display_page_size: 10000,
            main_query_fields: [],
            partial_match_titles: true,
            partial_match_text: true,
            fuzzy_search_level: 2,
            filters: {
                "standardized_country.lower_case": [country.toLowerCase()]
            }
        }
    }).then(async res => {
        if(res.data.message_data) {
            console.log('Failed to fetch.');
            console.log(res.data.message_data.error);
            process.exit(0);
        }

        console.log(`Fetched info for ${country}... ${res.data.value.hits.length}`);

        res.data.value.hits.forEach(hit => {
            facilities.push({
                country: hit._source.standardized_country,
                name: hit._source.name || 'Not Provided',
                address: hit._source.formatted_address
            });
        });
    }).catch(err => {
        console.log(err);
        process.exit(0);
    });
})).then(() => {
    console.log(`Fetched ${facilities.length} facilities.`);
    saveAsCsv(facilities);
});

function saveAsCsv(facilities) {
    const outputFileName = 'rubota_facilities.csv';
    let csvStream = csv.createWriteStream({ headers: true });
    let writableStream = fs.createWriteStream(outputFileName);

    writableStream.on("finish", () => {
        console.log(`Facilities written to ${outputFileName}`);
    });

    csvStream.pipe(writableStream);
    facilities.forEach(f => {
        csvStream.write(f);
    });

    csvStream.end();
}
