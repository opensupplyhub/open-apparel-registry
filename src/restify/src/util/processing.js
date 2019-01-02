const mongoose = require('../db').mongoose
const Factory = require('../models/factorySchema')
const Address = require('../models/addressSchema')
const Temp = require('../models/tempSchema')
const Geo = require('../models/geoSchema')
const https = require('https')
const allEntities = require('../assets/entity')
const defaultEntities = require('../assets/default-entity')
const region = require('../assets/region')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

// Convert a country string to a country code e.g. china --> cn
const getRegionCode = country => {
  // Make the first letter uppercase
  country = country.toLowerCase()
  const regionCode = region.find(r => (r.name && r.name == country) || (r.names && r.names.includes(country) || (r.code && r.code.toLowerCase() === country)))
  return (regionCode && regionCode.code) ? regionCode.code : country
}

const combineScore = (nameScore, addressScore) => nameScore * 3 + addressScore

// Ping google map geocode api to get Lat, Lon from an address, return a new `factory` object
const geocode = (address, factory, multi = false) => new Promise((res, rej) => {
  const regionCode = factory && factory.country ? getRegionCode(factory.country) : null
  console.log('regionCode: ', regionCode)

  if (process.env.GEOCODE_API === 'mapbox') {
    const geocodingClient = mbxGeocoding({ accessToken: process.env.GEOCODE_KEY })
    let queryObj = { query: address }
    if (regionCode && regionCode.length === 2) queryObj.countries = [regionCode]

    geocodingClient
    .forwardGeocode(queryObj)
    .send()
    .then(response => {
      const results = response.body
      if (results && results.features && results.features.length > 0) {
        if (multi) {
          return res(results.features)
        }
        const { place_name, geometry, place_type } = results[0]
        if (formatted_address && location && types) {
          factory = Object.assign(factory, {
            formatted_address: place_type,
            geo: { lat: geometry.coordinates[1], lon: geometry.coordinates[0]},
            address_type: place_type.toString(),
            geoObj: results[0]
          })
          return res(factory)
        }
      }
      factory.noAddress = 'Address Not Found'
      return res(factory)
    });
  } else if (process.env.GEOCODE_API === 'google') {
    address = encodeURIComponent(address)
    const urlParams = `${(regionCode && regionCode.length === 2) ? 'region=' + regionCode : ''}&address=${address}&key=${process.env.GEOCODE_KEY}`

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${urlParams}`
    console.log('urlParams: ', urlParams)
    https.get(url, response => {
      const { statusCode, headers: { 'content-type': contentType } } = response

      if (statusCode !== 200) {
        factory.noAddress = 'Address Not Found'
        handleError(`Request Failed.\n Status Code: ${statusCode}`, () => res(factory))
        return
      } else if (!/^application\/json/.test(contentType)) {
        factory.noAddress = 'Address Not Found'
        handleError(`Invalid content-type.\nExpected application/json but received ${contentType}`, () => res(factory))
        return
      }

      let rawData = ''

      response.setEncoding('utf8')
      response.on('data', chunk => rawData += chunk)
      response.on('end', () => {
        const { results } = JSON.parse(rawData)

        try {
          if (results && results.length > 0) {
            // If multi is true, return all the results
            // Otherwise return the first result
            if (multi) {
              return res(results)
            }

            const { formatted_address, geometry: { location }, types } = results[0]

            if (formatted_address && location && types) {
              factory = Object.assign(factory, {
                formatted_address,
                geo: Object.assign(location, { lon: location.lng }),
                address_type: types.toString(),
                geoObj: results[0]
              })

              delete factory.geo.lng
              return res(factory)
            }
          }

          factory.noAddress = 'Address Not Found'
          return res(factory)
        } catch (e) {
          factory.noAddress = 'Address Not Found'
          handleError(e.message, () => res(factory))
        }
      })
    })
    .on('error', (e) => {
      factory.noAddress = 'Address Not Found'
      handleError(e.message, () => res(factory))
    })
  }
})

const cleanName = (name, country = 'DEFAULT') => {
  // Lower case, remove , . ; : "
  let cleanName = name.toLowerCase().replace(/[|&;$%@"<>()+,.':]/g, " ").trim().replace(/ +(?= )/g, '')

  const entityObj = allEntities.find(e => e.code === country)
  if (!entityObj || !entityObj.entities) return cleanName.trim()

  if (country !== 'DEFAULT') entityObj.entities = entityObj.entities.concat(defaultEntities)

  const entities = entityObj.entities.map(e => e.toLowerCase().replace(/[|&;$%@"<>()+,.':]/g, " ").trim())
  let cleanShortName = cleanName
  entities.forEach(entity => {
    if (cleanShortName.includes(` ${entity}`)) {
      cleanShortName = cleanShortName.replace(` ${entity} `, ' ');
      // If entity doesn't include space
      if (entity.indexOf(' ') < 0) {
        cleanShortName = cleanShortName.split(' ')
        .filter((e, index) => !((index === cleanShortName.split(' ').length - 1 && e === entity) || (index === 0 && e === entity)))
        .join(' ');
      } else if (cleanShortName.indexOf(entity) === 0 || cleanShortName.indexOf(entity) === cleanShortName.length - entity.length){
        // If entity includes space, cannot split it by space
        cleanShortName = cleanShortName.replace(`${entity}`, ' ');
      }
    }
  })
  return cleanShortName.trim().replace(/ +(?= )/g, ''); // delete multiple space
}

const handleError = (errorMessage, callback) => {
  const error = new Error(errorMessage)
  console.error(error.message)
  callback()
}

const matchFactoryAddress = factory => new Promise((res, rej) => {
  const { country, name, address } = factory
  const countryCode = getRegionCode(country)
  const cleanedName = cleanName(name, countryCode)

  Factory.esSearch({
    from: 0,
    size: 50,
    query: {
      "match": {
        "name": {
          "query": cleanedName,
          "fuzziness": 0,
        }
      }
    }
  }, {
    hydrate: true,
    hydrateWithESResults: true,
    hydrateOptions: {select: 'cleaned_name name source country'}
  }, (err, factories) => {
    if (!factories || !factories.hits || !factories.hits.hits) return res(factory)

    let factoryIds = factories.hits.hits.filter(h => h.country === countryCode).map(f => { return f._id })
    let factoryScores = factories.hits.hits.filter(h => h.country === countryCode).map(f => ({ id: f._id.toString(), score: f._esResult._score }))

    Address.find({ related_factory: { $in: factoryIds }, country: countryCode })
    .populate({
      model: Factory,
      path: 'related_factory'
    })
    .exec()
    .then(addresses => {
      if (!addresses && !addresses.length) return res(factory)

      Address.esSearch({
        from: 0,
        size: 30,
        query: {
          "match": {
            "address": {
              "query": address,
              "fuzziness": 2
            }
          }
        }
      }, {
        hydrate: true,
        hydrateWithESResults: true,
        hydrateOptions: {select: 'address source country related_factory'}
      }, (err, fuzzyAdds) => {
        if (!fuzzyAdds || !fuzzyAdds.hits || !fuzzyAdds.hits.hits) return res(factory)
        let addressIds = fuzzyAdds.hits.hits.filter(h => h.country === countryCode).map(f => { return f._id.toString() })
        let addressScores = fuzzyAdds.hits.hits.filter(h => h.country === countryCode).map(f => ({ id: f._id.toString(), score: f._esResult._score }))
        factory.matched = addresses
        .filter(ad => addressIds.includes(ad._id.toString()))
        .map(a => {
          let stringFacIds = factoryIds.map(id => id.toString())
          let relate_fac = a.related_factory.find(relatedf => stringFacIds.includes(relatedf._id.toString()))
          let factoryScore = factoryScores.find(s => s.id === relate_fac._id.toString()).score
          let addressScore = addressScores.find(d => d.id === a._id.toString()).score

          return {
            name: relate_fac ? relate_fac.name : '',
            nameId: relate_fac ? relate_fac._id : '',
            addressId: a._id,
            address: a.address,
            nameScore: factoryScore || 0,
            addressScore: addressScore || 0,
            combinedScore: combineScore(factoryScore, addressScore)
          }
        })
        res(factory)
      })
    })
  })
})

const updateOneTemp = (temp, onlyProcessed) => {
  // If onlyProcessed is true, just find the temp by id and update its 'processed' as a Date, don't update other property
  if (onlyProcessed) {
    return Temp.findOneAndUpdate({ _id: temp._id }, {
      $set: { "processed": new Date(), "updated": new Date(), status: 'Processed' }
    }, { new: true })
  }

  // Else use the temp obj to update the temp
  return Temp.findOneAndUpdate({ _id: temp._id }, {
    $set: {
      "processed": new Date(),
      "matched": temp.matched,
      "updated": new Date(),
      status: 'Processed'
    }
  }, { new: true })
}

// Process each individual factory
const parseSingleNewFactory = (factory, sourceId) => {
  let { name, address, country } = factory
  country = getRegionCode(country)

  let cleaned_name = country ? cleanName(name, country) : null
  let option = { name, country }
  if (cleaned_name) option.cleaned_name = cleaned_name

  // 1. Find if there is a factory with this name, and this country, push source to its source[]
  // If not, create a new factory

  // 2. Find if there is a address has this address and this country, push factoryId to its related_factory[], push source to its source[]
  // If not, create a new address

  // 3. Find if there is a geo has this lat, lon and country, push addressId to its related_address[], push source to its source[]
  // If can not find, create a new Geo
  Factory.findOneAndUpdate(option, { $addToSet: { 'source': sourceId }, updated: new Date() }, {
    new: true, upsert: true, setDefaultsOnInsert: true
  })
  .then(factoryData => Address.findOneAndUpdate(
    { address, country },
    {
      $addToSet: {
        'source': sourceId,
        'related_factory': factoryData._id
      },
      updated: new Date()
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ))
  .then(async addressData => {
    const { _id: addressId, address } = addressData
    const geoRes = await geocode(address, { address, country }, true)

    if (!geoRes.length) return

    if (process.env.GEOCODE_API === 'mapbox') {
      const geoPromises = geoRes.map(geoObj => {
        const location = geoObj.geometry.coordinates
        return Geo.findOneAndUpdate(
          { 'geo.lat': location[1], 'geo.lon': location[0]  },
          { $addToSet: { 'source': sourceId, 'related_address': addressId }, updated: new Date() },
          { new: true },
          (err, geoData) => {
            if (err) console.log(err);
            if (geoData) {
              return
            } else {
              geoObj.geo = {
                'lat': location[0],
                'lon': location[1],
              }
              geoObj.source = [sourceId];
              geoObj.related_address = [addressId];
              Geo.create(geoObj, (err, newGeoDoc) => {
                if (err) console.log(err);
                console.log('new geoData._id: ', newGeoDoc._id);
                return
              })
            }
          }
        )
      })

      await Promise.all(geoPromises)
    } else if (process.env.GEOCODE_API === 'google') {
      const geoPromises = geoRes.map(geoObj => {
        let geoCountry, countryCode
        const countryType = geoObj.address_components.find(c => c.types.includes('country'))

        if (!countryType || !countryType.long_name) {
          console.log('Cannot find geo country for this address: ', address, ', id: ', addressId)
          return
        }

        geoCountry = countryType.long_name
        countryCode = getRegionCode(geoCountry)

        // If the geo.country !== related_address.country, don't update/create geo
        if (!countryCode || countryCode !== addressData.country) {
          console.log('country from google map API NOT EQUEAL to address\' country')
          console.log('countryCode: ', countryCode, ' addressData.country: ', addressData.country, ' addressData._id: ', addressData._id)
          return
        }

        return Geo.findOneAndUpdate(
          { 'place_id': geoObj.place_id },
          { $addToSet: { 'source': sourceId, 'related_address': addressId }, updated: new Date() },
          { new: true },
          (err, geoData) => {
            if (err) console.log(err);
            if (geoData) {
              console.log('geoData._id: ', geoData._id);
              console.log('geoData.source: ', geoData.source);
              return
            } else {
              geoObj.geo = {
                'lat': geoObj.geometry.location.lat,
                'lon': geoObj.geometry.location.lng,
              }
              geoObj.source = [sourceId];
              geoObj.related_address = [addressId];
              geoObj.country = countryCode;
              Geo.create(geoObj, (err, newGeoDoc) => {
                if (err) console.log(err);
                console.log('new geoData._id: ', newGeoDoc._id);
                return
              })
            }
          }
        )
      })

      await Promise.all(geoPromises)
    }
  })
  .then(() => continueToMatchTemp(factory))
}

const continueToMatchTemp = async factory => {
  let matchedFac = await matchFactoryAddress(factory)

  if (!matchedFac.matched || matchedFac.matched.length === 0) {
    return await updateOneTemp(matchedFac, true)
  }

  matchedFac.matched = matchedFac.matched.sort((a, b) => b.combinedScore - a.combinedScore)
  return await updateOneTemp(matchedFac, false)
}


module.exports = {
  getRegionCode,
  geocode,
  cleanName,
  handleError,
  matchFactoryAddress,
  updateOneTemp,
  continueToMatchTemp,
  parseSingleNewFactory,
  combineScore
}
