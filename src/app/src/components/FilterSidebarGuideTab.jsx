import React, { memo } from 'react';

import { filterSidebarStyles } from '../util/styles';

const FilterSidebarGuideTab = memo(() => (
    <div
        className="control-panel__content"
        style={filterSidebarStyles.controlPanelContentStyles}
    >
        <p className="control-panel__body">
            The Open Apparel Registry (OAR) is an open source tool which maps
            garment facilities worldwide and assigns a unique ID number to each.
            Its goal is to become the go-to source for identifying apparel
            facilities and their affiliations by collating disparate supplier
            lists from industry stakeholders into one central, open source map
            and database.
        </p>
        <p className="control-panel__body">
            The collated database of facility names, addresses and affiliated
            parties is powered by an advanced name and address-matching algorithm
            and will be available for use by any organization, for free.
        </p>
        <p className="control-panel__body">
            To contribute to the database, users must create a free account.
            Anyone can sign up and contribute. Users interested in browsing the
            OAR are able to access it without creating an account.
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
