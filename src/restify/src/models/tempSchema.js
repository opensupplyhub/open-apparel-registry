// Model for the temp
module.exports = (function tempSchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const Schema = mongoose.Schema;

  const tempSchema = new Schema({
    file_name: {
      type: 'String',
      required: true,
    },
    file_description: {
      type: 'String'
    },
    uid: { // The id from authentication service (e.g. firebase)
      type: 'String',
      required: true,
    },
    user_name: {	
      type: 'String',	
      required: true	
    },
    user_type: {
      type: 'String'
    },
    data: {
      type: 'Mixed' // everything in the csv file
    },
    matched: [{
      nameId: mongoose.Schema.Types.ObjectId,
      addressId: mongoose.Schema.Types.ObjectId,
      name: String,
      address: String,
      nameScore: Number,
      addressScore: Number,
      confidence: Boolean,
      confirm: Boolean
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
    },
    processed: {
      type: 'Date'
    },
    status: {
      type: 'String',
      default: 'Unprocessed'
    }
  });

  tempSchema.plugin(mongooseHistory, { customCollectionName: 'temps_history' });

  let Temp = mongoose.model('Temp', tempSchema);

  return Temp;
})();
