import React from 'react';
import { Link } from 'react-router-dom';
import map from 'lodash/map';

import { makeProfileRouteLink } from '../util/util';

const otherLocationStyles = Object.freeze({
    listItemStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingLeft: 0,
    }),
    spanStyles: Object.freeze({
        margin: '0 0 5px 0',
    }),
});

export default function FacilityDetailsSidebarOtherLocations({ data }) {
    if (!data || !data.length) {
        return null;
    }

    return (
        <div className="control-panel__group">
            <h1 className="control-panel__heading">Other locations:</h1>
            <div className="control-panel__body">
                <ul>
                    {map(data, location => (
                        <li
                            className="word-break"
                            key={location.contributor_name}
                        >
                            <div style={otherLocationStyles.listItemStyles}>
                                <span style={otherLocationStyles.spanStyles}>
                                    {location.lng}, {location.lat}
                                </span>
                                {location.contributor_id && location.contributor_name && (
                                    <span
                                        style={
                                            otherLocationStyles.spanStyles
                                        }
                                    >
                                        Contributed by{' '}
                                        <Link
                                            to={makeProfileRouteLink(
                                                location.contributor_id,
                                            )}
                                            href={makeProfileRouteLink(
                                                location.contributor_id,
                                            )}
                                        >
                                            {location.contributor_name}
                                        </Link>
                                    </span>
                                )}
                                {location.notes && (
                                    <span
                                        style={otherLocationStyles.spanStyles}
                                    >
                                        Notes: {location.notes}
                                    </span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
