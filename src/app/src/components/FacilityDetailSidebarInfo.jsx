import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { arrayOf, bool, number, oneOfType, string } from 'prop-types';
import isEqual from 'lodash/isEqual';

import ShowOnly from './ShowOnly';

import { makeProfileRouteLink } from '../util/util';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps.label, nextProps.label)
    && isEqual(prevProps.data, nextProps.data);

const FacilityDetailSidebarInfo = memo(({
    data,
    label,
    isContributorsList,
}) => {
    const makeContributorListItem =
        ([id, displayLabel]) => (
            <li key={id} className="word-break">
                <Link
                    to={makeProfileRouteLink(id)}
                    href={makeProfileRouteLink(id)}
                >
                    {displayLabel}
                </Link>
            </li>
        );

    const makeStringListItem = item => (
        <li key={item} className="word-break">
            {item}
        </li>);

    const createListItem = isContributorsList
        ? makeContributorListItem
        : makeStringListItem;

    return (
        <ShowOnly when={!!data.length}>
            <div className="control-panel__group">
                <h1 className="control-panel__heading">
                    {label}
                </h1>
                <div className="control-panel__body">
                    <ul>
                        {data.map(createListItem)}
                    </ul>
                </div>
            </div>
        </ShowOnly>
    );
}, propsAreEqual);

FacilityDetailSidebarInfo.defaultProps = {
    isContributorsList: false,
};

FacilityDetailSidebarInfo.propTypes = {
    data: arrayOf(oneOfType([
        arrayOf(oneOfType([
            number,
            string,
        ])),
        string,
    ])).isRequired,
    label: string.isRequired,
    isContributorsList: bool,
};

export default FacilityDetailSidebarInfo;
