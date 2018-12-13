// Model for the key
module.exports = (function keySchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const Schema = mongoose.Schema;

  const keySchema = new Schema({
    key: {
      type: 'String',
      required: true,
    },
    uid: {
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

  keySchema.plugin(mongooseHistory, { customCollectionName: 'key_history' });

  let Key = mongoose.model('Key', keySchema);

  return Key;
})();
