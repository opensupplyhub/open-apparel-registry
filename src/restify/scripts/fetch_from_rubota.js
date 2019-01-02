import axios from 'axios'
import csv from 'fast-csv';
import fs from 'fs';

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
]

let keymap = {}
let factories = []
Promise.all(countries.map(async country => {
  return axios({
    method: 'post',
    url: 'http://suppliers.rubota.com/api/search',
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
  })
  .then(async res => {
    if(res.data.message_data) {
      console.log('Failed to fetch.')
      console.log(res.data.message_data.error)
      process.exit(0)
    }

    console.log(`Fetched info for ${country}... ${res.data.value.hits.length}`)

    res.data.value.hits.forEach(hit => {
      Object.keys(hit._source).forEach(k => keymap[k] = `${typeof hit._source[k]}`)
      let f = Object.assign({}, hit._source, {
        address: hit._source.formatted_address,
        source: hit._source.block_source,
        type: hit._type,
        rubota_id: hit._id,
        workers: parseInt(hit._source.workers) || 0,
        status: hit._source.status ? hit._source.status[0] : null,
        country: hit._source.standardized_country,
        name: hit._source.name || 'Not Provided',
        about: hit._source.block_about,
        latitude: hit._source.latitude || 0,
        longitude: hit._source.longitude || 0,
      })
      factories.push(f);
    })
  })
  .catch(err => {
    console.log(err)
    process.exit(0)
  })
}))
.then(() => {
  console.log(`Fetched ${factories.length} factories.`)
  console.log('Found Keys: ', keymap)
  saveAsCsv(factories);
})

// JSON to csv, generate a factories.csv file at server root dir
function saveAsCsv(factories) {
  let csvStream = csv.createWriteStream({ headers: true }),
  writableStream = fs.createWriteStream("factories.csv");

  writableStream.on("finish", () => {
    console.log("Done Saving csv file!");
  });

  csvStream.pipe(writableStream);
  factories.forEach(f => {
    csvStream.write(f);
  });

  csvStream.end();
}
