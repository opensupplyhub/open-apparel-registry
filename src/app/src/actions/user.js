import firebase from 'firebase';
import axios from 'axios';
import { toast } from 'react-toastify';

import {
    makeUpdateSourceNameURL,
    makeUploadTempFacilityURL,
} from '../util/util';

firebase.initializeApp({
    apiKey: `${process.env.REACT_APP_FIREBASE_API_KEY}`,
    authDomain: `${process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}`,
    databaseURL: `${process.env.REACT_APP_FIREBASE_DATABASE_URL}`,
    projectId: `${process.env.REACT_APP_FIREBASE_PROJECT_ID}`,
    storageBucket: `${process.env.REACT_APP_FIREBASE_STORAGE_BUCKET}`,
    messagingSenderId: `${process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID}`,
});

// Add a user to the store. Should only be used to store the current user
export const addUser = user => () => ({ type: 'ADD_USER', ...user });

export const createUser = user => (dispatch) => {
    let uid;

    return firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
            const { password, ...userWithoutPassword } = user;

            if (res.user) {
                ({ uid } = res.user);

                // Use reference from auth database to create the user in the users database
                return firebase
                    .database()
                    .ref(`users/${uid}`)
                    .set({ ...userWithoutPassword });
            }

            return null;
        })
        .then(() => {
            toast('Successfully Created Account!');
            dispatch(addUser({ ...user, uid }));
        })
        .catch(error => toast(error.message));
};

// Create a firebase auth hook that will dispatch based on logged in state.
// This either populates the current user or removes a user from the store entirely
export const loadUser = () => (dispatch) => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            firebase
                .database()
                .ref(`users/${user.uid}`)
                .on('value', (snapshot) => {
                    if (snapshot && snapshot.val()) {
                        const userInfo = {
                            uid: user.uid,
                            name: snapshot.val().name,
                            email: user.email,
                            photo: snapshot.val().photo,
                            website: snapshot.val().website,
                            description: snapshot.val().description,
                            contributorType: snapshot.val().contributorType,
                        };

                        dispatch({ type: 'ADD_USER', ...userInfo });
                    } else {
                        dispatch({ type: 'NO_USER' });
                    }
                });
        } else {
            dispatch({ type: 'NO_USER' });
        }
    });
};

// Post the new source's name and contributorType to Ursa
const updateSourceNameOrType = (user) => {
    const { uid, name, contributorType } = user;

    if (!uid || !name) {
        return null;
    }

    const data = contributorType
        ? { name, user_type: contributorType }
        : { name };

    return axios
        .post(makeUpdateSourceNameURL, data)
        .then((response) => {
            if (response.status === 200) {
                toast('Contributor account created / updated successfully.');
            }
        })
        .catch(error => toast(error.message));
};

export const updateUser = (user, nameOrTypeUpdated) => (dispatch) => {
    const { currentUser } = firebase.auth();
    const credential = firebase.auth.EmailAuthProvider.credential(
        currentUser.email,
        user.password,
    );
    const { password, ...userWithoutPassword } = user;

    currentUser
        .reauthenticateAndRetrieveDataWithCredential(credential)
        .then(() => {
            currentUser.updateEmail(userWithoutPassword.email).then(() => {
                const {
                    photo,
                    ...userWithoutPasswordAndPhoto
                } = userWithoutPassword;
                // Remove blank attributes from an Object userWithoutPasswordAndPhoto,
                // otherwise firebase will throw error
                Object.keys(userWithoutPasswordAndPhoto).forEach(key =>
                    userWithoutPasswordAndPhoto[key] == null &&
                        delete userWithoutPasswordAndPhoto[key]);

                firebase
                    .database()
                    .ref(`users/${userWithoutPasswordAndPhoto.uid}`)
                    .update({ ...userWithoutPasswordAndPhoto })
                    .then(() => dispatch({ type: 'ADD_USER', ...user }))
                    .then(() => {
                        if (!nameOrTypeUpdated) {
                            toast('Contributor account created / updated successfully.');
                        } else {
                            updateSourceNameOrType(user);
                        }
                    })
                    .catch(error => toast(error.message));
            });
        })
        .catch(error => toast(error.message));
};

export const logIn = (email, password) => () =>
    firebase.auth().signInWithEmailAndPassword(email, password);
export const logOut = () => () => firebase.auth().signOut();

export const updateProfilePhoto = url => (dispatch) => {
    const { currentUser } = firebase.auth();
    firebase
        .database()
        .ref(`users/${currentUser.uid}`)
        .update({ photo: url })
        .then(() => dispatch({ type: 'UPDATE_PROFILE_PHOTO', url }));
};

// Posts the factories to Ursa, along with some user data
export const uploadFactoriesListToUrsa = (
    user,
    list,
    fileDisplayName,
    fileDescription,
    callback,
    done,
) => () => {
    const data = {
        file: JSON.stringify(list),
        file_name: fileDisplayName.replace(/[^a-zA-Z0-9 ]/g, ''),
        file_description: fileDescription,
        user_name: user.name,
        user_type: user.contributorType ? user.contributorType : 'Other',
    };

    return axios
        .post(makeUploadTempFacilityURL(user.uid), data)
        .then((response) => {
            if (response.data && response.data.message) {
                toast(response.data.message);
                done(false);
            } else {
                callback();
            }
        })
        .catch((error) => {
            done(false);
            toast(error.message);
        });
};

// If you're on a profile page of a different user, or are not logged in,
// load a user based on the uid in the URL
export const loadSelectedUser = (uid, callback) => () => {
    firebase
        .database()
        .ref(`users/${uid}`)
        .on('value', snapshot => callback(snapshot.val()));
};

export const checkAccess = () => dispatch => dispatch({ type: 'CHECK_ACCESS' });

export const sendUserEmail = emailAddress => () => {
    const auth = firebase.auth();

    auth.sendPasswordResetEmail(emailAddress)
        .then(() => {
            toast(`Successfully sent instructions to ${emailAddress}`);
        })
        .catch((error) => {
            toast(error.message);
        });
};
