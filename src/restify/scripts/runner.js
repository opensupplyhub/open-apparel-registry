require('babel-register')({
  presets: [ 'es2015' ],
  plugins: ['babel-polyfill']
})

console.log("Running script in file: ", process.argv[2])

module.exports = require(`../${process.argv[2]}`)