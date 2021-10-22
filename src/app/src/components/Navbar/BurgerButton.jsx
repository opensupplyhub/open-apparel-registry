import React from 'react';

const BurgerButton = ({ activeNav, setActive }) => {
    const title = 'main';
    const isActive = activeNav === title;
    const toggleNav = () => (isActive ? setActive(null) : setActive(title));
    return (
        <button
            type="button"
            className="burger"
            id="mobile-nav-toggle"
            onClick={toggleNav}
        >
            <div className="burger__icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 24">
                    <g stroke="#FFF" fill="none" fillRule="evenodd">
                        <path d="M.5.5h27v3.571H.5zM.5 10.786h27v3.571H.5zM.5 19.929h27V23.5H.5z" />
                    </g>
                </svg>
            </div>
            <div className="burger__close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
                    <path
                        d="M25 25h-4.49l-7.44-9.263L5.514 25H1l9.692-11.9L1 1h4.49l7.44 9.263L20.486 1H25l-9.691 11.899L25 25Z"
                        stroke="#FFF"
                        fill="none"
                        fillRule="evenodd"
                    />
                </svg>
            </div>
        </button>
    );
};

export default BurgerButton;
