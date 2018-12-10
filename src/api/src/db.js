var mongoose = require('mongoose');

mongoose.connect(process.env.DB_PATH);
var db = mongoose.connection;

db.on('error', function () {
	console.log('error occured from db');
});

db.once('open', function dbOpen() {
	console.log('successfully opened the db');
});

// When the connection is disconnected
db.on('disconnected', function () {
  console.log('Mongoose default connection to the db disconnected');
});

const gracefulExit = function() { 
  mongoose.connection.close(function () {
    console.log('Mongoose default connection with the db is disconnected through app termination');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

exports.mongoose = mongoose;
