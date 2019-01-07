// Model for the source
module.exports = (function sourceSchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const Schema = mongoose.Schema;

  const sourceSchema = new Schema({
    name: { 
      type: 'String',
      required: true,
    },
    file_name: {
      type: 'Array',
      required: true,
    },
    uid: { // The id from authentication service (e.g. firebase) 
      type: 'String'
    },
    user_type: {
      type: 'String'
    },
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

  sourceSchema.plugin(mongooseHistory, { customCollectionName: 'sources_history' });

  let Source = mongoose.model('Source', sourceSchema);

  return Source;
})();
