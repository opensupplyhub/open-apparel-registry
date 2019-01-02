function sourceController () {
  const Source = require('../models/sourceSchema');
  const Temp = require('../models/tempSchema');
  const async = require('async');

  // Get all sources
  this.getAllSource = function(req, res) {
    Source.find({})
      .lean()
      .exec((err, result) => {
      if (err) {
        console.log(err);
        return res.send({ 'error': err }); 
      } else if (result) {
        async.mapSeries(result, (source, done) => {
          const { uid } = source
          Temp.find({ uid })
            .sort({ created_at: -1 })
            .lean()
            .limit(1)
            .exec((err, temps) => {
              if (err) done(null, {})
              if (temps && temps.length >= 1) {
                const temp = temps[0];
                const { created_at, file_name, file_description } = temp;
                const sourceWithList = source;
                sourceWithList.list = { created_at, file_name, file_description };
                done(null, sourceWithList)
              } else done(null, source)
            })
        }, async(err, sourceWithLists) => {
          if (err) console.log(err)
          return res.send({ 'sources': sourceWithLists });
        })
      }
    });
  };

  // Update one source's name
  this.updateSourceName = function(req, res) {
    const { uid } = req.params;
    const { name } = req.body;
    if (!uid || !name) return res.send('Missing uid or name')
    Source.findOneAndUpdate(
      { uid },
      { $set: { name } }, // Do not update "updated", we are using "updated" to determine the time of a new list is added
      { new: true }
    ).exec((err, newSource) => {
      if (err) {
        console.log(err);
        return res.send({ 'error': err }); 
      } else {
        return res.send({ 'source': newSource });
      }
    });
  };

  return this;
}

module.exports = new sourceController();
