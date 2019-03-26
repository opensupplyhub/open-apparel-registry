const mongoose = require('../db').mongoose
const Source = require('../models/sourceSchema')
const Temp = require('../models/tempSchema')
const ProcessingUtil = require('./processing')
const async = require('async')

module.exports = async () => {
  // 1. Find 100 temps that is "Unprocessed"
  const temps = await Temp.find({ processed: { $exists: false }, status: 'Unprocessed' }).limit(100).exec()

  // 2. Change all temp status to "Processing" 
  const tempUpdatePromises = temps.map(({ _id }) => Temp.findOneAndUpdate({ _id }, { $set: { status: 'Processing' } }))

  await Promise.all(tempUpdatePromises)

  // 3. Find / create a source for each temp
  // We can NOT do this in parallel, it might create duplicate sources with the same uid and user_name
  async.mapSeries(temps, (temp, done) => {
    const { uid, user_name, file_name, data, _id, user_type } = temp
    Source.findOneAndUpdate(
      { uid },
      { $addToSet: { file_name }, updated: new Date(), name: user_name, user_type },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    .exec((err, source) => {
      if (err) console.log(err)
      if (source) done(null, { source, data, _id })
    })
  }, async(err, tempWithSource) => {
    if (err) console.log(err)

    // 4. for each temp, parse it into factory, address, geo with source
    const processingPromises = tempWithSource.map(({ data, _id, source }) => ProcessingUtil.parseSingleNewFactory({ ...data, _id }, source._id))

    await Promise.all(processingPromises)
  })
}
