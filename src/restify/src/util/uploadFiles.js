const Temp = require('../models/tempSchema');
const csv = require('fast-csv');
const mongoose = require('../db').mongoose;

const accounts = [
  {
    uid: 'uid1',
    user_name: 'test 22',
    file_name: 'test list 22',
    file_description: 'test des 22',
    csv_file_name: 'test-short-22.csv'
  },
  {
    uid: 'uid2',
    user_name: 'test 23',
    file_name: 'test list 23',
    file_description: 'test des 23',
    csv_file_name: 'test-short-23.csv'
  },
  {
    uid: 'uid3',
    user_name: 'test 24',
    file_name: 'test list 24',
    file_description: 'test des 24',
    csv_file_name: 'test-short-24.csv'
  }
]

// Upload .csv files of factories, save to a TEMP factory collection
const uploadTempFactory = (account, res) => {
  const { uid, user_name, file_description, csv_file_name } = account;
  let { file_name } = account;

  // Remove special charactors other than a-z, 0-9, A-Z
  file_name = file_name.replace(/[^a-zA-Z0-9 ]/g, "");

  if (!uid || !file_description || !file_name || !user_name) {
    console.log('Missing uid or user name or file name or file description');
    return res.send('Missing uid or user name or file name or file description');
  }

  const factories = [];
  const newTimestamp = new Date().getTime();
  file_name = `${file_name}_${newTimestamp}`

  console.log('csv_file_name: ', csv_file_name)
  return csv
  .fromPath(`./files/${csv_file_name}`, {
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
      file_description
    };
    factories.push(temp);
  })
  .on("end", () => {
    const valid = factories.every(t => t.data.name && t.data.address && t.data.country)
    if (valid) {
      Temp.create(factories, (err, documents) => {
        if (err) throw err;
      });
      console.log('factories: ', factories)

      console.log(factories.length + ' TEMP factories have been successfully uploaded.');
      // return res.send(factories.length + ' TEMP factories have been successfully uploaded.');
    } else {
      console.log('Invalid CSV file, please check the column headers, and make sure each row has non-empty name, country and address')
      // return res.send({ 'message': 'Invalid CSV file, please check the column headers, and make sure each row has non-empty name, country and address' })
    }
  })
  .on('error', error => {
    console.log('Invalid CSV file, please save the file as Comma Separated Values (.csv)')
    // return res.send({ 'message': 'Invalid CSV file, please save the file as Comma Separated Values (.csv)' })
  })
}

module.exports = (req, res) => {
  Promise.all(accounts.map(async account => {
    console.log('account: ', account)
    return uploadTempFactory(account)
  }))
  .then(() => {
    console.log('done!')
    return res.send('done!')
  })
}
