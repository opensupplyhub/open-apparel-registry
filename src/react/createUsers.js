// Before running this script , we need to go to firebase - Rules,
// update rules from - 
// {
//   "rules": {
//     ".read": true,
//    	"users": {
//       "$user_id": {
//         ".write": "$user_id === auth.uid"
//       }
//     }
//   }
// }
// To -
// {
//   "rules": {
//     ".read": true,
//    	".write": true
//   }
// }
// Otherwise will get permission deny error

const firebase = require('firebase')

const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_FIREBASE_DOMAIN',
  databaseURL: 'YOUR_FIREBASE_DATABASE_URL',
  projectId: 'YOUR_FIREBASE_PROJECT_ID',
  storageBucket: 'YOUR_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_FIREBASE_MESSAGING_SENDER_ID'
}

const users = [
  {
    name: 'NAME1',
    email: 'NAME1@GMAIL.COM',
    password: '123456'
  },
  {
    name: 'NAME2',
    email: 'NAME2@GMAIL.COM',
    password: '123456'
  },
  {
    name: 'NAME3',
    email: 'NAME3@GMAIL.COM',
    password: '123456'
  }
]

firebase.initializeApp(firebaseConfig)

const createUser = async user => {
  let uid
  return firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
  .then(res => {
    const { password, ...userWithoutPassword } = user
    if (res.user) {
      ({ uid } = res.user)

      // Use reference from auth database to create the user in the users database
      return firebase.database().ref(`users/${uid}`)
      .set({ ...userWithoutPassword }, error => {
        if (error) {
          console.log('error: ', error)
        } else {
          console.log('Data saved successfully!')
        }
      })
    }

    return null
  })
  .catch(error => console.log(error.message))
}

const promises = users.map(async user => {
  const { email, name, password } = user
  await createUser({ email, name, password })

  return null
})

Promise.all(promises)
