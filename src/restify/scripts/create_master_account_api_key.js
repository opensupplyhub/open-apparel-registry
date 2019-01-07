const Key = require('../src/models/keySchema');
const uuidV4 = require('uuid/v4');

var key = new Key({
	key: uuidV4(),
	uid: process.env.MASTER_ACCOUNT,
	created_at: new Date(),
	updated: new Date()
})

key.save((err, key) => {
	if(err) {
		console.log(err);
		process.exit(1);
	} else {
		console.log('MASTER ACCOUNT API KEY: ' + key.key);
		process.exit(0);
	}
});
