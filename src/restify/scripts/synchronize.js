const mongoose = require('../src/db').mongoose;

var schemas = [
	require('../src/models/factorySchema'),
	require('../src/models/addressSchema'),
	require('../src/models/geoSchema')
]

var done = 0;
function finished() {
	done++;

	if(done >= schemas.length) {
		process.exit(0);
	}
}

for(var i = 0; i < schemas.length; i++) {
	let modelName = schemas[i].modelName;
	console.log('Indexing ' + modelName + '...');

	let stream = schemas[i].synchronize();
	let count = 0;

	stream.on('data', (err, doc) => {
		count++;
	});

	stream.on('close', () => {
		console.log('indexed ' + count + ' ' + modelName + ' documents!');
		finished();
	});

	stream.on('error', err => {
		console.log(err);
		process.exit(1);
	});
}
