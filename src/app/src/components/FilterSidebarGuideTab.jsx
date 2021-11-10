import React from 'react';
import { Link } from 'react-router-dom';

import { filterSidebarStyles } from '../util/styles';
import { authRegisterFormRoute, InfoLink, InfoPaths } from '../util/constants';

export default function FilterSidebarGuideTab({ vectorTile }) {
    if (!vectorTile) {
        return (
            <div
                className="control-panel__content"
                style={filterSidebarStyles.controlPanelContentStyles}
            >
                <p className="control-panel__body">
                    The Open Apparel Registry (OAR) is an open data tool for
                    correctly identifying global apparel facilities and their
                    affiliations. The OAR collates disparate supplier lists from
                    industry stakeholders into one global map and registry and
                    assigns each unique facility an OAR ID.
                </p>
                <p className="control-panel__body">
                    The collated database of facility names, addresses and
                    affiliated parties, pulled from public and contributed data,
                    is powered by an advanced name and address-matching
                    algorithm, developed by geospatial software firm, Azavea.
                    The free-to-use, open source tool can be used by any
                    organization to update and standardize a supplier list
                    against the database, view facility affiliations and use the
                    OAR ID as a unique and shared ID across software systems and
                    databases.
                </p>
                <p className="control-panel__body">
                    To contribute to the database, users must create a free
                    account at the Register tab on the main toolbar. Anyone can
                    sign up and contribute. Users interested in browsing the OAR
                    are able to search the site without creating an account.
                </p>
                <a
                    href={`${InfoLink}/${InfoPaths.aboutUs}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline"
                >
                    Learn More
                </a>
            </div>
        );
    }

    return (
        <div
            className="control-panel__content"
            style={filterSidebarStyles.controlPanelContentStyles}
        >
            <p className="control-panel__body">
                The Open Apparel Registry (OAR) is an open data tool for
                identifying global apparel facilities and their affiliations
                (“Contributors”). The OAR brings together facility lists from
                industry stakeholders into one map and registry and assigns each
                unique facility an OAR ID.
            </p>
            <p className="control-panel__body">How does it work?</p>
            <ol>
                <li>
                    With a{' '}
                    <Link
                        to={authRegisterFormRoute}
                        href={authRegisterFormRoute}
                    >
                        Free Account
                    </Link>
                    , industry stakeholders can add a list of facilities, from
                    any tier of the supply chain (excluding raw materials - so
                    no cotton farms or cattle ranches, for example)
                </li>
                <li>
                    The OAR software checks the uploaded list against facilities
                    already in the system and uses the name and address to
                    either match the facility with one already in the system, or
                    to create a new facility on the map
                </li>
                <li>
                    The user who added the list reviews the suggested matches
                    and new listings and, in some instances where the algorithm
                    cannot automatically make a decision, will be required to
                    manually confirm or reject the options
                </li>
                <li>
                    New, confirmed facilities are given their own unique OAR ID
                    - a valuable tool for linking facilities across software
                    systems and databases - and are added to the map
                </li>
                <li>
                    Facilities that match with an entry already in the OAR
                    database are updated to include the association with the new
                    organization (the “Contributor”)
                </li>
            </ol>
            <p className="control-panel__body">
                Anybody can search the facilities and view associated
                affiliations. Users can search the site by entering a facility
                name or OAR ID number; searching by a particular contributor (or
                multiple contributors); or searching by country (or multiple
                countries). All of these search filters can be used in
                combination.
            </p>
            <p className="control-panel__body">
                Users can download the data for free by clicking the “Download”
                button (free account required) or{' '}
                <a href="/api/docs/">connecting via API</a>.
            </p>
            <p className="control-panel__body">
                By default, the map includes all facilities in the database and
                is updated as new facilities are added. The list of facilities
                in the left column corresponds to the dots on the map, with the
                dot colors representing the volume of facilities in that area.
                As users zoom on the map, the dots update to reflect the change
                in density as the area represented by the dot changes. The
                legend (or key) for the dots is visible on the bottom left of
                the OAR map.
            </p>
            <a
                href={`${InfoLink}/${InfoPaths.aboutUs}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
            >
                Learn More
            </a>
        </div>
    );
}
