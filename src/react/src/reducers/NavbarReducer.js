const initialState = {
    userDropdownOpen: false,
};

const NavbarReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'TOGGLE_USER_DROPDOWN':
            return { ...state, userDropdownOpen: !state.userDropdownOpen };
        default:
            return state;
    }
};

export default NavbarReducer;
