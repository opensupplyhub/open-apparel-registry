// Model for the Factory
module.exports = (function factorySchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const mongoosastic = require('mongoosastic');
  const mongoosasticConfig = require('../../config/mongoosasticConfig')
  const Schema = mongoose.Schema;

  const factorySchema = new Schema({
    name: {
      type: 'String',
      required: true,
      es_indexed: true,
      es_type: 'text'
    },
    cleaned_name: { 
      type: 'String',
      es_indexed: true,
      es_type: 'text'
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
    confirmed_factory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Confrim'
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

  factorySchema.plugin(mongooseHistory, { customCollectionName: 'factories_history' });

  factorySchema.plugin(mongoosastic, mongoosasticConfig('factory'));

  let Factory = mongoose.model('Factory', factorySchema);

  Factory.createMapping({
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
      "factory": {
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
  // let stream = Factory.synchronize();
  // let count = 0;

  // stream.on('data', (err, doc) => {
  //   count++;
  // });
  // stream.on('close', () => {
  //   console.log('indexed ' + count + ' Factory documents!');
  // });
  // stream.on('error', err => {
  //   console.log(err);
  // });

  return Factory;
})();
