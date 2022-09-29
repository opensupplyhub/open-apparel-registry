import React from 'react';
import { Link } from 'react-router-dom';
import { useMenuClickHandlerContext } from './MenuClickHandlerContext';

const getColumnKey = column => {
    const firstSectionLabel = column[0].label;
    if (firstSectionLabel && firstSectionLabel !== '') {
        return firstSectionLabel;
    }

    return column[0].items[0].label;
};

export default function NavSubmenu({ columns, open }) {
    const lastIndex = columns.length - 1;

    return (
        <div className="nav-submenu" style={open ? { maxHeight: '500px' } : {}}>
            <div className="nav-submenu__container">
                <div className="nav-submenu__grid">
                    {columns.map((column, index) => (
                        <SubmenuColumn
                            key={getColumnKey(column)}
                            column={column}
                            last={index === lastIndex}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SubmenuColumn({ column, last }) {
    const lastClass = ' nav-submenu__col--last';

    return (
        <div className={`nav-submenu__col${last ? lastClass : ''}`}>
            {column.map(columnSection => (
                <SubmenuColumnSection
                    key={columnSection.label}
                    columnSection={columnSection}
                />
            ))}
        </div>
    );
}

function SubmenuColumnSection({ columnSection }) {
    return (
        <>
            <h3 className="nav-submenu__heading">{columnSection.label}</h3>
            <ul className="nav-submenu__list">
                {columnSection.items.map(sectionItem => (
                    <SubmenuColumnSectionItem
                        key={sectionItem.label}
                        sectionItem={sectionItem}
                    />
                ))}
            </ul>
        </>
    );
}

function SubmenuColumnSectionItem({ sectionItem }) {
    const createMenuClickHandler = useMenuClickHandlerContext();

    switch (sectionItem.type) {
        case 'link':
            return (
                <li className="nav-submenu__list-item">
                    <a
                        className="nav-submenu__link"
                        href={sectionItem.href}
                        target=""
                        onClick={createMenuClickHandler()}
                    >
                        {sectionItem.label}
                    </a>
                </li>
            );
        case 'button':
            return (
                <li className="nav-submenu__list-item nav-submenu__list-item--button">
                    <Link
                        className="button button--yellow"
                        to={sectionItem.href}
                        onClick={createMenuClickHandler(sectionItem.action)}
                    >
                        <span>{sectionItem.label}</span>
                    </Link>
                </li>
            );
        case 'auth-button':
            return (
                <li className="nav-submenu__list-item nav-submenu__list-item--button">
                    {sectionItem.href ? (
                        <Link
                            className="button button--auth"
                            to={sectionItem.href}
                            onClick={createMenuClickHandler()}
                        >
                            <span>{sectionItem.label}</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            className="button button--auth"
                            onClick={createMenuClickHandler(sectionItem.action)}
                        >
                            <span>{sectionItem.label}</span>
                        </button>
                    )}
                </li>
            );
        default:
            throw new Error(
                `Invalid submenu column section item type: ${sectionItem.type}`,
            );
    }
}
