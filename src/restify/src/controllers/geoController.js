function geoController () {
  const Geo = require('../models/geoSchema');
  const Address = require('../models/addressSchema');
  const ProcessingUtil = require('../util/processing')

  this.getAllCountry = function(req, res) {
    Geo.distinct("country", { 'related_address.1': { $exists: true } })
    .exec((err, countries) => {
      if (err) {
        console.log('err: ', err);
        return res.send({ 'error': err });
      } else {
        return res.send({"countries": countries});
      }
    })
  }

  this.addCountrytoGeo = function(req, res) {
    Geo.find({ country: { $exists: false } })
    .exec((err, itmes) => {
      itmes.forEach(item => {
        console.log('item._id: ', item._id)
        let countryCode;
        const countryType = item.address_components.find(c => c.types.includes('country'));
        if (countryType && countryType.long_name) {
          countryCode = ProcessingUtil.getRegionCode(countryType.long_name);
          if (countryCode) {
            Geo.update({_id: item._id}, {
              $set: {"country":  countryCode }
            }, {new: true},
            (err, res) => console.log('res: ', res))
          }
        }
      })
    })
  }

  // Clean up geo, if geo.country !== related_address.country, delete that relate_address
  this.cleanGeoAddress = function(req, res) {
    Geo.find({})
    .populate({
      model: Address,
      path: 'related_address'
    })
    .exec((err, geos) => {
      console.log('geos.length: ', geos.length)
      geos.forEach(geo => {
        // console.log('geo._id: ', geo._id)
        geo.related_address.forEach(address => {
          if (geo.country !== address.country) {
            Geo.update({_id: geo._id}, {
              $pull: { "related_address":  address._id }
            }, {new: true},
            (err, res) => console.log('res: ', res))
          }
        })
      })
    })
  }

  return this;
}

module.exports = new geoController();
