import { createContext, useContext } from 'react';

const MenuClickHandlerContext = createContext((callback = () => {}) => () =>
    callback(),
);

export function useMenuClickHandlerContext() {
    return useContext(MenuClickHandlerContext);
}

export default MenuClickHandlerContext;
