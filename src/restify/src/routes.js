module.exports = function(app) {
  const factory = require('./controllers/factoryController');
  const source = require('./controllers/sourceController');
  const geo = require('./controllers/geoController');
  const temp = require('./controllers/tempController');
  const key = require('./controllers/keyController');
  const AuthUtil = require('./util/auth');

  app.get('/', (req, res) => res.send("WELCOME TO REST API URSA!"));

  app.get('/healthCheck', temp.checkIfNeedsProcessing);

  // GET http://localhost:8000/searchFactoryNameCountry?name=&country=
  app.get('/searchFactoryNameCountry', factory.searchFactoryNameCountry); // Search factories by name (fuzzy match) within a country

  // GET http://localhost:8000/allcountry
  app.get('/allcountry', geo.getAllCountry); // Get all countries in the databse API

  // GET http://localhost:8000/totalFactories
  app.get('/totalFactories', factory.totalFactories); // Get total factories

  // GET http://localhost:8000/allsource
  app.get('/allsource', source.getAllSource); // Get all source in the databse API

  // GET http://localhost:8000/matchSingleFactory?name=xx&country=xx&address=xx
  app.get('/matchSingleFactory', factory.matchSingleFactory); // Match one factory

  // ----------------------------------------------
  // The following routes need authentication, need API key
  // POST http://localhost:8000/uploadTempFactory/yDRp7CGJODXTtSggSiqcEOTY1BI3 body: {file, file_name, file_description}
  app.post('/uploadTempFactory/:uid', AuthUtil.checkAPIKey, temp.uploadTempFactory); // Upload factories from a csv file API, save to a TEMP collection

  // GET http://localhost:8000/getLists/:uid
  app.get('/getLists/:uid', AuthUtil.checkAPIKey, temp.getLists); // Get all the temp who has this uid, group them by file_name

  // POST http://localhost:8000/confirmTemp/:id
  app.post('/confirmTemp/:id', AuthUtil.checkAPIKey, temp.confirmTemp); // update temp.matched[].confirm (true / false)

  // GET http://localhost:8000/getList/:uid?file_name=
  app.get('/getList/:uid', AuthUtil.checkAPIKey, temp.getList); // get one list for a user with this file name

  // POST http://localhost:8000/updateSourceName/:uid
  app.post('/updateSourceName/:uid', AuthUtil.checkAPIKey, source.updateSourceName); // Update one source's name

  // GET http://localhost:8000/generateKey?key=
  app.get('/generateKey/:uid', AuthUtil.checkAPIKey, key.generateKey); // get an API key for redpanda user
}
