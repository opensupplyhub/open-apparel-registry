import React, { memo } from 'react';

const FilterSidebarGuideTab = memo(() => (
    <div className="control-panel__content">
        <p className="control-panel__body">
            The Open Apparel Registry (OAR) is a tool to
            identify every apparel facility worldwide.
            It is an open sourced, global database of
            apparel (garments, footwear and accessories)
            facility names and locations. The tool
            normalizes uploaded data - specifically
            facility names and addresses - submitted by
            contributors such as brands, industry
            associations and non-profits and assigns
            each facility a unique OAR ID number. Each
            contributor is listed next to every facility
            it has submitted.
        </p>
        <p className="control-panel__body">
            To contribute to the database, users must
            create an account. Anyone can sign up and
            contribute. Users interested in browsing the
            OAR are able to access it freely without
            creating an account.
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
