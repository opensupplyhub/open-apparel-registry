const initialState = {
    lists: {},
    selectedList: '',
};

const ListsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_LISTS':
            return { ...state, lists: action.payload, selectedList: '' };
        case 'UPDATE_LIST': {
            const newLists = { ...state.lists, ...action.payload };
            return { ...state, lists: newLists };
        }
        case 'SELECT_LIST':
            return { ...state, selectedList: action.payload };
        case 'TOGGLE_ROW': {
            const { rowId } = action.payload;
            const listName = state.selectedList;
            const newList = state.lists[listName].map((row) => {
                if (row._id === rowId) { // eslint-disable-line no-underscore-dangle
                    row.hidden = !row.hidden; // eslint-disable-line no-param-reassign
                    return row;
                }
                return row;
            });
            const newListObj = {};
            newListObj[listName] = newList;
            const newLists = { ...state.lists, newListObj };
            return { ...state, lists: newLists };
        }
        case 'CONFIRM_DENY_MATCH': {
            const { confirm, tempId, matchedId } = action.payload;
            const listName = state.selectedList;
            const newList = state.lists[listName].map((row) => {
                /* eslint-disable no-underscore-dangle */
                if (row._id === tempId) { // eslint-disable-line no-param-reassign
                    /* eslint-enable no-underscore-dangle */
                    row.matched = row.matched.map((m) => { // eslint-disable-line no-param-reassign
                        if (m._id === matchedId) { // eslint-disable-line no-underscore-dangle
                            m.confirm = confirm; // eslint-disable-line no-param-reassign
                            return m;
                        }
                        return m;
                    });
                    return row;
                }
                return row;
            });
            const newListObj = {};
            newListObj[listName] = newList;
            const newLists = { ...state.lists, ...newListObj };
            return { ...state, lists: newLists };
        }
        case 'RESET_LISTS':
            return initialState;
        default:
            return state;
    }
};

export default ListsReducer;
