import React from 'react';
import { connect } from 'react-redux';

import { setGDPROpen } from '../../actions/ui';
import { SubmenuLinks, InfoLink } from '../../util/constants';

const MobileNavParent = ({
    title,
    activeSubmenu,
    setActiveSubmenu,
    onClose,
    openGDPR,
}) => {
    const isActive = activeSubmenu === title;
    const toggleSubmenu = () =>
        isActive ? setActiveSubmenu(null) : setActiveSubmenu(title);
    const handleClose = () => {
        setActiveSubmenu(null);
        onClose();
    };
    const navSubmenuStyle = isActive
        ? {
              left: 0,
              width: '100%',
              top: 0,
              opacity: 1,
              zIndex: 2,
              height: 'auto',
              minHeight: '100%',
          }
        : { height: 0, opacity: 0 };

    const renderLink = ({ text, url, external, button }) => {
        if (button) {
            return (
                <button
                    type="button"
                    className="mobile-nav__button mobile-nav__link--level-2"
                    style={{ borderTop: '0.0625rem solid #fff' }}
                    key={text}
                    onClick={() => {
                        openGDPR();
                        handleClose();
                    }}
                >
                    {text}
                </button>
            );
        }

        return (
            <div className="mobile-nav__item" key={text}>
                <a
                    className="mobile-nav__link mobile-nav__link--level-2"
                    href={`${InfoLink}/${url}`}
                    target={external && '_blank'}
                    onClick={handleClose}
                >
                    {text}
                </a>
            </div>
        );
    };
    return (
        <div className="mobile-nav__item mobile-nav__parent">
            <button
                type="button"
                className="mobile-nav__button"
                onClick={toggleSubmenu}
            >
                <span>{title}</span>
                <span className="mobile-nav__arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
                        <path
                            d="m.5 6.641 15.224 9.447L.5 25.388V31l24.419-14.875L.5 1z"
                            stroke="#FFF"
                            fill="none"
                            fillRule="evenodd"
                        />
                    </svg>
                </span>
            </button>
            <div className="mobile-nav__submenu" style={navSubmenuStyle}>
                <button
                    type="button"
                    className="mobile-nav__back"
                    onClick={toggleSubmenu}
                >
                    <div className="mobile-nav__back-arrow">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 9 11"
                        >
                            <path
                                d="M8.953 8.932 3.371 5.468l5.582-3.41V0L0 5.454 8.953 11z"
                                fill="#FFF"
                                fillRule="evenodd"
                            />
                        </svg>
                    </div>
                    <span>Back</span>
                </button>
                {SubmenuLinks[title].map(renderLink)}
            </div>
        </div>
    );
};

function mapDispatchToProps(dispatch) {
    return {
        openGDPR: () => dispatch(setGDPROpen(true)),
    };
}

export default connect(null, mapDispatchToProps)(MobileNavParent);
