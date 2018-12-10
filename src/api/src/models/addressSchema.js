// Model for the address
module.exports = (function addressSchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const mongoosastic = require('mongoosastic');
  const mongoosasticConfig = require('../../config/mongoosasticConfig')
  const Schema = mongoose.Schema;

  const addressSchema = new Schema({
    address: {
      type: 'String',
      required: true,
      es_indexed: true,
      es_type: 'text'
    },
    country: {
      type: 'String',
      es_indexed: true,
      es_type: 'text'
    },
    related_factory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory'
    }],
    source: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source'
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

  addressSchema.plugin(mongooseHistory, { customCollectionName: 'addresses_history' });

  addressSchema.plugin(mongoosastic, mongoosasticConfig('address'));

  let Address = mongoose.model('Address', addressSchema);

  Address.createMapping({
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
      "address": {
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

  // // Indexing
  // let stream = Address.synchronize();
  // let count = 0;

  // stream.on('data', (err, doc) => {
  //   count++;
  // });
  // stream.on('close', () => {
  //   console.log('indexed ' + count + ' Address documents!');
  // });
  // stream.on('error', err => {
  //   console.log(err);
  // });

  return Address;
})();
