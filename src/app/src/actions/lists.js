import axios from 'axios';
import { toast } from 'react-toastify';

import {
    makeGetListsURL,
    makeUpdateListURL,
    makeConfirmTempURL,
} from '../util/util';

// Get lists for this user from ursa
export const setLists = (uid, callback) => dispatch =>
    axios
        .get(makeGetListsURL(uid))
        .then((response) => {
            if (
                response &&
                response.data.lists &&
                Object.keys(response.data.lists).length > 0
            ) {
                dispatch({ type: 'SET_LISTS', payload: response.data.lists });
            } else {
                dispatch({ type: 'RESET_LISTS' });
            }
            callback();
        })
        .catch(error => toast(error.message));

// Pin ursa to parse Temp, and return a new list
export const updateList = (uid, selectedList, callback) => dispatch =>
    axios
        .get(makeUpdateListURL(uid, selectedList))
        .then((response) => {
            const newList = {};
            newList[selectedList] = response.data.temps;
            dispatch({ type: 'UPDATE_LIST', payload: newList });
            callback(selectedList, false);
        })
        .catch(error => toast(error.message));

// Toggle one row in a list to be open or closed
export const toggleRow = rowId => dispatch =>
    dispatch({ type: 'TOGGLE_ROW', payload: { rowId } });

// Update one match in temp.matched[], confirm: true / false
export const confirmDenyMatch = (confirm, tempId, matchedId) => dispatch =>
    axios
        .post(makeConfirmTempURL(tempId), { confirm, matchedId })
        .then((response) => {
            if (response.status === 200) {
                dispatch({
                    type: 'CONFIRM_DENY_MATCH',
                    payload: { confirm, tempId, matchedId },
                });
            }
        })
        .catch(error => toast(error.message));

// Select one list
export const selectList = selectedList => dispatch =>
    dispatch({ type: 'SELECT_LIST', payload: selectedList });
