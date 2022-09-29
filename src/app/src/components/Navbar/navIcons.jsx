import React from 'react';

export const BurgerIcon = ({ show }) => (
    <div
        className="burger__icon"
        style={show ? {} : { opacity: 0, transform: 'scale(0.5)' }}
    >
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 24">
            <path
                d="M0 24v-3h36v3H0Zm0-10.5v-3h36v3H0ZM0 3V0h36v3H0Z"
                fill="#0D1128"
            />
        </svg>
    </div>
);

export const BurgerClose = ({ show }) => (
    <div
        className="burger__close"
        style={show ? { opacity: 1, transform: 'scale(1)' } : {}}
    >
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28">
            <path
                d="m2.45 27.65-2.1-2.1L11.9 14 .35 2.45l2.1-2.1L14 11.9 25.55.35l2.1 2.1L16.1 14l11.55 11.55-2.1 2.1L14 16.1 2.45 27.65Z"
                fill="#0D1128"
            />
        </svg>
    </div>
);

export const SubmenuButtonArrow = () => (
    <div className="nav-submenu-button__arrow">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
            <path
                d="m4 4.969-3.5-3.5.817-.817L4 3.335 6.683.652l.817.817-3.5 3.5Z"
                fill="#191919"
            />
        </svg>
    </div>
);

export const BackButtonArrowLeft = () => (
    <div className="mobile-nav-back-button__arrow-left">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 22">
            <path
                d="M10 21.667 0 10.833 10 0l1.775 1.923-8.225 8.91 8.225 8.91L10 21.668Z"
                fill="#191919"
            />
        </svg>
    </div>
);

export const MobileSubmenuButtonArrowRight = () => (
    <span className="mobile-nav-submenu-button__arrow-right">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 20">
            <path
                d="m1.775 0 10 10-10 10L0 18.225 8.225 10 0 1.775 1.775 0Z"
                fill="#191919"
            />
        </svg>
    </span>
);

export const MobileSubmenuButtonArrowLeft = () => (
    <div className="mobile-nav-back-button__arrow-left">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 22">
            <path
                d="M10 21.667 0 10.833 10 0l1.775 1.923-8.225 8.91 8.225 8.91L10 21.668Z"
                fill="#191919"
            />
        </svg>
    </div>
);

export const MobileSubmenuButtonArrowDown = () => (
    <span className="mobile-nav-submenu-button__arrow-down">
        <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 12">
            <path
                d="M20 2 10 12 0 2 1.775.225 10 8.45 18.225.225 20 2Z"
                fill="#191919"
            />
        </svg>
    </span>
);
