# Ursa-major
A RESTful API for searching / matching / uploading factories in mongo and elastic search database. It uses MongoDB to store all the facroties, and Elastic search database to fuzzy match factory names. You can choose mapbox ot google as your geocode API.

## Get Started
- Run `$npm install`
- Update `.env`, please see `.env.example` for refernece
- Run `$npm run dev`

Go to `localhost:8000`, you should be able ro see 'WELCOME TO REST API URSA!'

### More about `.env` file

DB_PATH=mongodb://(Mongodb databse uri)

PORT=8000

ES_HOST=Elastic search database host

ES_PORT=Elastic search database port

ES_AUTH=Elastic search database Auth

MASTER_ACCOUNT=a firebase uid, the account that holds all the seed factories

WORKER=true (If worker is true, wheneven localhost:8000/healthCheck is hit, it will get 100 temp documents, and parse it into factory, address, and geo, and find matches for that temp)

GEOCODE_API=mapbox or google

GEOCODE_KEY=your geocode api key

NODE_ENV=production or development

## Deploy
Run `$eb deploy`

## Test
- Install Jest globally so we can use `jest` in command line: `yarn global add jest`
- Run `$npm run test` (no need to Run `$npm run dev`)

## Indexing production database
- connect to prod database, update .env file
- Uncomment indexing code in `addressSchema.js`, `factorySchema.js` and `geoSchema.js`
- In app.js, comment out `// if (process.env.NODE_ENV === 'development') {` and `// } else if (process.env.NODE_ENV === 'production') { Raven.config(process.env.SENTRY_KEY).install()}`
- Run $`NODE_ENV=production node src/app.js`


## Upload a batch of files in for each account
Uncomment `routes.js`, `app.get('/uploadMultipleFiles', temp.uploadMultipleFiles);`
Create a folder `files` at the root directory, put all the CSV files in it.
Update `accounts` in `uploadFiles.js` with your uid, file_name, file_description, csv_file_name.
`csv_file_name` is the name of the CSV file in the `files` folder

```
GET localhost:8000/uploadMultipleFiles
```
