function factoryController () {
  const mongoose = require('../db').mongoose;
  const csv = require('fast-csv');
  const fs = require('fs');
  const _ = require('lodash');
  const Factory = require('../models/factorySchema');
  const Address = require('../models/addressSchema');
  const Geo = require('../models/geoSchema');
  const Source = require('../models/sourceSchema');
  const Confirm = require('../models/confirmSchema');
  const ProcessingUtil = require('../util/processing')

  // Get total factories
  this.totalFactories = (req, res) => Factory.find().count()
  .then(count => res.send({ 'total': count }))
  .catch(err => res.send({ 'error': err }))

  // Fetching Details of Factory
  this.getFactory = (req, res) => Factory.find({})
  .limit(10)
  .then(result => res.send({ 'factoryDetails': result }))
  .catch(err => res.send({ 'error': err }))

  this.searchFactoryNameCountry = (req, res) => {
    const { name, country, contributor } = req.query
    const contributorStr = contributor + '';
    let cleanedName, sourceCondition, allContributors;
    if (name) cleanedName = name.split(',').map(n => ProcessingUtil.cleanName(n));
    if (!cleanedName) {
      let conditions = {};
      
      if (contributor) {
        conditions.source = { $in: contributor.split(',') };
      }

      if (country) conditions.country = { $in: country.split(',') };
      Geo.find(conditions)
      .limit(2000)
      .populate({
        model: Address,
        path: 'related_address',
        populate: {
          model: Factory,
          path: 'related_factory',
          populate: {
            model: Source,
            path: 'source'
          }
        }
      })
      .then(geos => {
        if (allContributors && allContributors.length > 0) flatGeo(geos, res, allContributors, contributorStr)
        else flatGeo(geos, res, null, contributorStr)
      })
    } else {
      // Search mongodb data factory by nameusing regex
      const condition = new RegExp(cleanedName, "i");
      const conditionName = new RegExp(name, "i");
      Factory.find({ $or: [{ name: { $regex: condition }}, {name: { $regex: conditionName }}, { name }] })
      .then(factories => {
        if (!factories.length) return res.send([])

        let factoryIds;

        if (country) {
          const countryCodes = country.split(',')
          factoryIds = factories.filter(h => countryCodes.indexOf(h.country) > -1).map(f => f._id)
        } else {
          factoryIds = factories.map(f => f._id);
        }

        if (factoryIds.length <= 0) return res.send([]);

        let addressOption = { related_factory: { $in: factoryIds } };

        if (country) addressOption.country = { $in: country.split(',') };

        Address.find(addressOption)
        .then(addresses => {
          if (addresses && addresses.length > 0) {
            let addressIds = addresses.map(c => c._id);

            let conditions = { related_address: { $in: addressIds } };

            if (contributor) {
              conditions.source = { $in: contributor.split(',') };
            }
            if (country) conditions.country = { $in: country.split(',') };

            Geo.find(conditions)
            .populate({
              model: Address,
              path: 'related_address',
              populate: {
                model: Factory,
                path: 'related_factory',
                populate: [{
                  model: Source,
                  path: 'source'
                }, {
                  model: Confirm,
                  path: 'confirmed_factory',
                  populate: {
                    model: Source,
                    path: 'source'
                  }
                }
                ]
              }
            })
            .then(geos => {
              if (allContributors && allContributors.length > 0) flatGeo(geos, res, allContributors, contributorStr)
              else flatGeo(geos, res, null, contributorStr)
            })
          } else {
            return res.send([])
          }
        });
      })
      .catch(err => res.send({ 'error': err }))
    }
  }

  // Recursively flattens an array down to a deepness of 1
  const flatten = array => {
    return array.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])
  }

  const flatGeo = (geos, res, source, contributor) => {
    let flatFactories = flatten(geos.map(m => m.related_address.map(mAddress => mAddress.related_factory.map(mFactory => ({
      _id: m._id,
      longitude: m.geo.lon,
      latitude: m.geo.lat,
      name: mFactory.name,
      nameId: mFactory._id,
      address: mAddress.address,
      addressId: mAddress._id,
      source: mFactory.source,
      confirm: mFactory.confirmed_factory,
      uniqueId: `${m._id}_${mFactory._id}_${mAddress._id}`,
      updated: m.updated
    })))))
    if (source) {
      flatFactories = flatFactories.filter(f => {
        const fSource = f.source.map(s => s._id.toString())
        return _.difference(source, fSource).length === 0
      })
    }
    groupGeo(flatFactories, res, contributor);
  }

  // Takes an array of geo, group them if they have the same _id(geo id), and the same clean name, add otherNames[], otherNameIds[], otherAddresses[], otherAddressesIds[] property
  const groupGeo = (factories, res, contributor) => {
    factoriesWithGeo = factories.map(f => {
      f.lat_lon = `${f.latitude.toFixed(1)}_${f.longitude.toFixed(1)}`;
      return f;
    })
    // Group them by geo lat and long
    const groupedData = _.groupBy(factoriesWithGeo, 'lat_lon');

    let finalGeos = [];
    for (let geoId in groupedData) {
      if (groupedData[geoId].length === 1) {
        finalGeos.push(groupedData[geoId][0])
      } else if (groupedData[geoId].length > 1) {
        let cleanGroup = groupedData[geoId].map(g => {
          // Delete any space in the cleaned_name, so "viet nam" will be "vietnam"
          g['cleanedName'] = ProcessingUtil.cleanName(g.name).replace(/\s/g,'');
          return g;
        })
        // Group them by cleanedName
        const groupName = _.groupBy(cleanGroup, 'cleanedName');
        for (let name in groupName) {
          if (groupName[name].length === 1) {
            finalGeos.push(groupName[name][0]);
          } else if (groupName[name].length > 1) {
            groupName[name] = groupName[name].sort((a, b) => b.source.length - a.source.length) // start with whoever has more sources
            const confrimed = groupName[name].filter(f => f.confirm && f.confirm.length > 0).sort((a, b) => b.source.length - a.source.length)
            let metaGroup
            if (confrimed && confrimed.length > 0) {
              metaGroup = groupName[name][0]
              metaGroup.confirm = confrimed[0].confirm
            } else {
              metaGroup = groupName[name][0]
            }
            let allSourceArray = []
            // Combined all the sources
            groupName[name].forEach(g => {
              allSourceArray = allSourceArray.concat(g.source)
            })
            const uniqAllSourceArray = _.uniqBy(allSourceArray, '_id')
            metaGroup['source'] = uniqAllSourceArray
            metaGroup['otherAddresses'] = groupName[name].map(g => g.address).filter(a => a !== metaGroup.address);
            metaGroup['otherAddressIds'] = groupName[name].map(g => g.addressId).filter(a => a !== metaGroup.addressId);
            metaGroup['otherNames'] = groupName[name].map(g => g.name).filter(a => a !== metaGroup.name);
            metaGroup['otherNameIds'] = groupName[name].map(g => g.nameId).filter(a => a !== metaGroup.nameId);
            finalGeos.push(metaGroup);
          }
        }
      }
    }
    filterRecentSource(finalGeos, res)
  }

  // geo.source[] filter out the source when last file was uploaded (source.updated) is later than geo.updated
  // Only show the most recent list of one source's geo
  // If source = []empty array, it's fine too
  const filterRecentSource = (geos, res, contributor) => {
    const filteredGeos = geos.map(g => {
      g.source = g.source.filter(s => {
        // If the source is seed factories(master account), keep this source
        if (s.uid && process.env.MASTER_ACCOUNT && s.uid === process.env.MASTER_ACCOUNT) return true
        if (s.file_name && s.file_name.length) {
          // If source only has one file, keep this source
          if (s.file_name.length <= 1) return true
          // If source has more than one file
          else if (s.file_name.length > 1) {
            // Find the time when the lastest file was added, filename_timestamp
            const fileTimes = s.file_name.map(f => {
              let fileName
              if (f[0]) fileName = f[0].toString()
              else fileName = f.toString()
              return fileName.substring(fileName.length - 13, fileName.length)
            }).sort((a, b) => b - a)
            let latestfileTime
            if (fileTimes && fileTimes[0]) {
              latestfileTime = fileTimes[0]
              if (latestfileTime && latestfileTime - Date.parse(g.updated) > 0) return false
            } else {
              // If the lastest file was added after this geo was update, don't show this source
              if (s.updated - g.updated > 0) return false
            }
            return true
          }
        } else return false
      })
      return g
    });
    // Filter out the geo without any source
    let geoWithSource = filteredGeos.filter(f => (f.source && f.source.length && f.source.length > 0))
    if (contributor) geoWithSource = geoWithSource.filter(f => {
      const contributorArray = contributor.split(',')
      const intersect = ifTwoArrayIntersect(contributorArray, f.source.map(s => s._id + ''))
      return intersect
    })
    return res.send(geoWithSource)
  }

  const ifTwoArrayIntersect = (array1, array2) => {
    const intersection = array1.filter(value => -1 !== array2.indexOf(value))
    return intersection && intersection.length > 0
  }

  // Upload .csv files of factories, save to db
  this.uploadFactory = (req, res) => {
    if (!req.body) {
      return res.send('No files were uploaded.');
    }

    const factoryFile = req.body;
    const factories = [];
    const { file_name, uid, name } = req.params;
    const newTimestamp = new Date().getTime();
    const fileName = `${file_name}_${newTimestamp}`;
    let sourceId;

    csv
    .fromString(factoryFile.toString(), {
      headers: true,
      ignoreEmpty: true
    })
    .on("data", data => {
      data['_id'] = new mongoose.Types.ObjectId();
      factories.push(data);
    })
    .on("end", () => {
      // Find if there is a source with this name and uid(firebase id), push fileName to file_name[], return source._id (mongo id)
      // If not, create a new source
      Source.findOneAndUpdate(
        { 'uid': uid, name },
        {
          $addToSet: { 'file_name': fileName },
          updated: new Date()
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      .then(sourceData => parseNewFactory(factories, res, sourceData._id, false))
    });
  }

  const parseNewFactory = async (factories, res, sourceId, continueToMatch) => {
    // Loop through each row in the csv file
    await Promise.all(factories.map(factory => ProcessingUtil.parseSingleNewFactory(factory, sourceId, continueToMatch)))
    res.send(factories.length + ' factories have been successfully uploaded.')
  }

  const calculateConfience = (nameScore, addressScore) => combineScore(nameScore,addressScore) > 70

  const combineScore = (nameScore, addressScore) => nameScore * 3 + addressScore

  this.matchSingleFactory = (req, res) => {
    const { country, name, address } = req.query;
    if (!name) return res.send('Missing name query string');
    if (!country) return res.send('Missing country query string');
    if (!address) return res.send('Missing address query string');

    const factory = { country, name, address };
    ProcessingUtil.matchFactoryAddress(factory)
    .then(result => {
      if (result.matched) {
        result.matched = result.matched
        .map(m => Object.assign(m, { confidence: calculateConfience(m.nameScore, m.addressScore) }))
        .sort((a, b) => b.combinedScore - a.combinedScore)
      }
      return res.send({ 'matchedFactory': result });
    })
  }

  return this;
};

module.exports = new factoryController();
