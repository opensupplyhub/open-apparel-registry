// Model for the confirm (confirmed factories by users)
module.exports = (function confirmSchema() {
  const mongoose = require('../db').mongoose;
  const mongooseHistory = require('mongoose-history');
  const Schema = mongoose.Schema;

  const confirmSchema = new Schema({
    name: { // the name from temp.data.name
      type: 'String',	
      required: true	
    },
    address: { // the address from temp.data.address
      type: 'String',
      required: true,
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Source',
      required: true,
    },
    related_temp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temp',
      required: true,
    },
    nameId: { // the nameId from temp.machted[nameId]
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Factory',
      required: true,
    },
    addressId: { // the addressId from temp.machted[addressId]
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
      required: true,
    },
    matched_id: { // the _id from temp.machted[_id]
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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

  confirmSchema.plugin(mongooseHistory, { customCollectionName: 'confirms_history' });

  let Confirm = mongoose.model('Confirm', confirmSchema);

  return Confirm;
})();
