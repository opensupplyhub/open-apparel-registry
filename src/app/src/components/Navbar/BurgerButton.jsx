import React from 'react';
import { BurgerClose, BurgerIcon } from './navIcons';

export default function BurgerButton({ showMobileMenu, toggleMobileMenu }) {
    return (
        <button type="button" className="burger" onClick={toggleMobileMenu}>
            {/* Both icons are displayed because css handles visiblity to enable transitions */}
            <BurgerClose show={showMobileMenu} />
            <BurgerIcon show={!showMobileMenu} />
        </button>
    );
}
