import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { arrayOf, bool, string } from 'prop-types';
import isEqual from 'lodash/isEqual';

import ShowOnly from './ShowOnly';
import BadgeVerified from './BadgeVerified';
import COLOURS from '../util/COLOURS';
import { facilityDetailsContributorPropType } from '../util/propTypes';

import { makeProfileRouteLink } from '../util/util';

const propsAreEqual = (prevProps, nextProps) =>
    isEqual(prevProps.label, nextProps.label) &&
    isEqual(prevProps.data, nextProps.data);

const styles = {
    badgeVerified: {
        width: '13px',
        verticalAlign: 'top',
        margin: '-2px 4px 0px 0px',
    },
};

const FacilityDetailSidebarInfo = memo(
    ({ data, label, isContributorsList, embed }) => {
        const makeContributorListItem = ({
            id,
            name,
            is_verified: isVerified,
        }) => (
            <li key={id} className="word-break">
                <ShowOnly when={isVerified}>
                    <span title="Verified">
                        <BadgeVerified
                            color={COLOURS.NAVY_BLUE}
                            style={styles.badgeVerified}
                        />
                    </span>
                </ShowOnly>
                {id && !embed ? (
                    <Link
                        to={makeProfileRouteLink(id)}
                        href={makeProfileRouteLink(id)}
                    >
                        {name}
                    </Link>
                ) : (
                    name
                )}
            </li>
        );

        const makeStringListItem = item => (
            <li key={item} className="word-break">
                {item}
            </li>
        );

        const createListItem = isContributorsList
            ? makeContributorListItem
            : makeStringListItem;

        return (
            <ShowOnly when={!!data.length}>
                <div className="control-panel__group">
                    <h1 className="control-panel__heading">{label}</h1>
                    <div className="control-panel__body">
                        <ul>{data.map(createListItem)}</ul>
                    </div>
                </div>
            </ShowOnly>
        );
    },
    propsAreEqual,
);

FacilityDetailSidebarInfo.defaultProps = {
    isContributorsList: false,
};

FacilityDetailSidebarInfo.propTypes = {
    data: arrayOf(facilityDetailsContributorPropType).isRequired,
    label: string.isRequired,
    isContributorsList: bool,
};

export default FacilityDetailSidebarInfo;
