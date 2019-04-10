import React, { memo } from 'react';

import { filterSidebarStyles } from '../util/styles';

const FilterSidebarGuideTab = memo(() => (
    <div
        className="control-panel__content"
        style={filterSidebarStyles.controlPanelContentStyles}
    >
        <p className="control-panel__body">
            The Open Apparel Registry (OAR) is an open data tool for correctly
            identifying global apparel facilities and their affiliations. The
            OAR collates disparate supplier lists from industry stakeholders
            into one global map and registry and assigns each unique facility an
            OAR ID.
        </p>
        <p className="control-panel__body">
            The collated database of facility names, addresses and affiliated
            parties, pulled from public and contributed data, is powered by an
            advanced name and address-matching algorithm, developed by
            geospatial software firm, Azavea. The free-to-use, open source tool
            can be used by any organization to update and standardize a supplier
            list against the database, view facility affiliations and use the
            OAR ID as a unique and shared ID across software systems and
            databases.
        </p>
        <p className="control-panel__body">
            To contribute to the database, users must create a free account at
            the Register tab on the main toolbar. Anyone can sign up and
            contribute. Users interested in browsing the OAR are able to search
            the site without creating an account.
        </p>
        <a
            href="http://info.openapparel.org/about"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
        >
            Learn More
        </a>
    </div>
));

export default FilterSidebarGuideTab;
