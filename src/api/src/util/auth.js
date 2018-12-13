const errors = require('restify-errors');
const Key = require('../models/keySchema');

const checkAPIKey = (req, res, next) => {
  const { key } = req.query;
  if (!key) return next(new errors.NotAuthorizedError());

  Key.find({ key })
    .exec((err, result) => {
    if (err) {
      console.log(err);
      return next(new errors.NotAuthorizedError());
    }
    if (result && result.length && result.length > 0) {
      next();
    } else return next(new errors.NotAuthorizedError());
  });
}

module.exports = {
  checkAPIKey
}
