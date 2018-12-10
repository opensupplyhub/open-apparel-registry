function keyController () {
  const Key = require('../models/keySchema');
  const uuidV4 = require('uuid/v4');

  // Get all sources
  this.generateKey = function(req, res) {
    const { uid } = req.params;
    if (!uid) return res.send('Missing uid')
    const key = uuidV4();
    Key.findOneAndUpdate(
      { uid },
      { key, updated: new Date() },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).exec((err, result) => {
      if (err) {
        console.log(err);
        return res.send({ 'error': err }); 
      } else {
        return res.send({ 'key': result });
      }
    });
  };

  return this;
}

module.exports = new keyController();
