const Temp = require('../models/tempSchema');
const csv = require('fast-csv');
const mongoose = require('../db').mongoose;
const processTemp = require('../util/processTemp')
const Confirm = require('../models/confirmSchema');
const Source = require('../models/sourceSchema');
const Factory = require('../models/factorySchema');
const uploadFiles = require('../util/uploadFiles')
const http = require('http')

function tempController () {
  // Upload .csv files of factories, save to a TEMP factory collection
  this.uploadTempFactory = function(req, res) {
    if (!req.body.file) {
      return res.send('No files were uploaded.');
    }

    if (req.body.file.size / 1024 / 1024 > 5) {
      return res.send('File too large. Please make it be less than 5 MB');
    }

    const { uid } = req.params;
    const { user_name, file_description, user_type } = req.body;
    let { file_name } = req.body;

    // Remove special charactors other than a-z, 0-9, A-Z
    file_name = file_name.replace(/[^a-zA-Z0-9 ]/g, "");

    if (!uid || !file_description || !file_name || !user_name) {
      return res.send('Missing uid or user name or file name or file description');
    }

    const factoryFile = JSON.parse(req.body.file);
    const factories = [];
    const newTimestamp = new Date().getTime();
    file_name = `${file_name}_${newTimestamp}`

    csv
    .fromString(factoryFile.toString(), {
      headers: true,
      ignoreEmpty: true
    })
    .on("data", data => {
      let temp = {
        _id: new mongoose.Types.ObjectId(),
        data,
        file_name,
        uid,
        user_name,
        file_description,
        user_type
      };
      factories.push(temp);
    })
    .on("end", () => {
      const valid = factories.every(t => t.data.name && t.data.address && t.data.country)
      if (valid) {
        Temp.create(factories, (err, documents) => {
          if (err) throw err;
        });

        return res.send(factories.length + ' TEMP factories have been successfully uploaded.');
      } else {
        return res.send({ 'message': 'Invalid CSV file, please check the column headers, and make sure each row has non-empty name, country and address' })
      }
    })
    .on('error', error => {
      return res.send({ 'message': 'Invalid CSV file, please save the file as Comma Separated Values (.csv)' })
    })
  }

  // Get all the temp who has this uid, group them by file_name
  this.getLists = function(req, res) {
    if (!req.params.uid) return res.send('Missing uid')
    Temp.find({ uid: req.params.uid })
    .exec((err, temps) => {
      if (err) console.log(err);
      if (temps && temps.length > 0) {
        const lists = temps.reduce((groups, t) => {
          const value = t.file_name
          groups[value] = groups[value] || []
          groups[value].push(t)
          return groups
        }, {})
        return res.send({ lists });
      } else {
        return res.send({ 'lists': [] });
      }
    })
  }

  // Get all the temp who has this uid, and file_name 
  this.getList = function(req, res) {
    const { uid } = req.params
    const { file_name } = req.query
    if (!uid) return res.send('Missing uid')
    if (!file_name) return res.send('Missing file_name')
    Temp.find({ uid, file_name })
    .exec((err, temps) => {
      if (err) console.log(err);
      if (temps && temps.length > 0) {
        return res.send({ temps });
      } else {
        return res.send({ 'temps': [] });
      }
    })
  }

  // update temp.matched[].confirm (true / false)
  this.confirmTemp = function(req, res) {
    if (!req.params.id) return res.send('Missing id')
    const { confirm, matchedId } = req.body
    Temp.findOneAndUpdate(
      { _id: req.params.id, "matched._id": matchedId },
      { $set: { "matched.$.confirm": confirm } },
      { new: true }
    ).exec((err, newTemp) => {
      if (err) console.log(err);
      if (!confirm) return res.send({ 'temp': newTemp });

      // 0. If confirm is true
      // 0.5 Find the source by temp.uid
      // 1. Created a new confirm document
      // 2. Push the new confirm id to factory.confirmed_factory[] and confirm.source to factory.source[]
      Source.findOne({ uid: newTemp.uid })
      .exec((err, source) => {
        if (err) console.log(err)
        if (!source) return res.send({ 'temp': newTemp });

        const matchedObj = newTemp.matched.find(m => m._id.toString() === matchedId)

        if (!matchedObj) return res.send({ 'temp': newTemp });
        const { nameId, addressId } = matchedObj
        const confirmObj = {
          "name" : newTemp.data.name,
          "address" : newTemp.data.address,
          nameId,
          addressId,
          "source" : source._id,
          "related_temp" : newTemp._id,
          "matched_id" : matchedId,
        }
        Confirm.create(confirmObj, (err, newConfirm) => {
          if (err) console.log(err);
          Factory.findOneAndUpdate(
            { _id: newConfirm.nameId },
            { $addToSet: { 'confirmed_factory': newConfirm._id, 'source': newConfirm.source }},
            { new: true }
          ).exec((err, newFactory) => {
            if (err) console.log(err);
            return res.send({ 'temp': newTemp });
          })
        })
      })
    })
  }

  // Check if there's anything in the temp collection that needs processing
  // and process it
  this.checkIfNeedsProcessing = (req, res) => {
    console.log('Health Check')
    if (process.env.WORKER) {
      setTimeout(processTemp, 500) // Process stuff after we've sent back our response
      res.send()
    } else {
      http.get(`${process.env.WORKER_URL}/healthCheck`, () => res.send())
    }
  }

  this.uploadMultipleFiles = (req, res) => {
    return uploadFiles(req, res)
  }

  // Loop through the existing temps, if temp.matched[].confirm === true
  // Create a new Confirm, link it to Factory
  this.addConfirm = (req, res) => {
    Temp.find({ "matched.0": { $exists: true }, "uid": { $ne: "vtfG26Mbb9M59CnW6a0jud31fKH2" } })
    .exec((err, temps) => {
      if (err) console.log(err);
      temps.forEach(newTemp => {
        console.log('newTemp._id: ', newTemp._id)
        const matched = newTemp.matched.filter(m => m.confirm)
        console.log('matched.length: ', matched.length)
        if (matched.length <= 0) {
          console.log('no confirmed macth for temp: ', newTemp._id)
          return
        }
        Source.findOne({ uid: newTemp.uid })
        .exec((err, source) => {
          if (err) console.log(err)
          if (!source) {
            console.log('can not find source: ', uid)
            return
          }
          matched.forEach(matchedObj => {
            console.log('matchedObj: ', matchedObj)
            const { nameId, addressId, _id } = matchedObj
            const confirmObj = {
              "name" : newTemp.data.name,
              "address" : newTemp.data.address,
              nameId,
              addressId,
              "source" : source._id,
              "related_temp" : newTemp._id,
              "matched_id" : _id,
            }
            Confirm.create(confirmObj, (err, newConfirm) => {
              if (err) console.log(err);
              console.log('newConfirm: ', newConfirm)
              Factory.findOneAndUpdate(
                { _id: newConfirm.nameId },
                { $addToSet: { 'confirmed_factory': newConfirm._id, 'source': newConfirm.source }},
                { new: true }
              ).exec((err, newFactory) => {
                if (err) console.log(err);
                console.log('newFactory: ', newFactory)
              })
            })
          })
        })
      })
    })
  }

  // Return how many temp has exact match or has confirmed match
  this.matchRate = (req, res) => {
    Temp.find({ "matched.0": { $exists: true }, "uid": { $ne: "vtfG26Mbb9M59CnW6a0jud31fKH2" } })
    .exec((err, temps) => {
      if (err) console.log(err);
      console.log('temps.length: ', temps.length)
      const totalLength = temps.length
      console.log('totalLength: ', totalLength)
      let matchLength = 0
      temps.forEach(newTemp => {
        const matched = newTemp.matched.filter(m => {
          if (m.confirm) return true
          if (m.name === newTemp.data.name && m.address === newTemp.data.address) return true
          return false
        })
        if (matched.length <= 0) {
          return
        }
        const oneLength = matched.length
        matchLength += 1
        console.log('continue')
        console.log('matchLength: ', matchLength)
      })
    })
  }
}

module.exports = new tempController();
