// Model for the geo
module.exports = (function geoSchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const mongoosastic = require('mongoosastic');
  const mongoosasticConfig = require('../../config/mongoosasticConfig')
  const Schema = mongoose.Schema;

  const geoSchema = new Schema({
    address_components: Array,
    formatted_address: String,
    geometry: Object,
    partial_match: Boolean,
    place_id: String,
    types: Array,
    geo: {
      type: 'Object',
      es_type: 'geo_point',
      es_indexed: true
    },
    country: {
      type: 'String',
      es_indexed: true,
      es_type: 'text'
    },
    source: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source'
    }],
    related_address: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }],
    created_at: {
      type: 'Date',
      default: Date.now,
      required: true
    },
    updated: {
      type: 'Date',
      default: Date.now,
      required: true
    }
  });

  geoSchema.plugin(mongooseHistory, { customCollectionName: 'geos_history' });

  geoSchema.plugin(mongoosastic, mongoosasticConfig('geo'));

  let Geo = mongoose.model('Geo', geoSchema);

  Geo.createMapping({
    "settings": {
      "analysis": {
        "analyzer": {
          "ursa_analyzer": {
            "type": "custom",
            "tokenizer": "standard",
            "filter": ["trim", "lowercase", "asciifolding", "english_stop", "en_snow"]
          }
        },
        "filter": {
          "en_snow": {
            "type": "snowball",
            "language": "English"
          },
          "english_stop": {
            "type": "stop",
            "stopwords": "_english_"
          }
        }
      }
    },
    "mappings": {
      "geo": {
        "_all": {
          "analyzer": "ursa_analyzer",
          "search_analyzer": "ursa_analyzer"
        }
      }
    }
  }, (err, mapping) => {
    if (err){
      console.log('error creating mapping (you can safely ignore this)');
      console.log(err);
    } else {
      console.log('mapping created!');
      console.log(mapping);
    }
  });

  // Indexing
  // let stream = Geo.synchronize();
  // let count = 0;

  // stream.on('data', (err, doc) => {
  //   count++;
  // });
  // stream.on('close', () => {
  //   console.log('indexed ' + count + ' Geo documents!');
  // });
  // stream.on('error', err => {
  //   console.log(err);
  // });

  return Geo;
})();
