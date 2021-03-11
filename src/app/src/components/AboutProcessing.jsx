/* eslint-disable */
import React from 'react';
import Grid from '@material-ui/core/Grid';

import AppGrid from './AppGrid';
import AppOverflow from './AppOverflow';

import confirm from '../images/about/processing/confirm.png';
import matched from '../images/about/processing/matched.png';
import newfacility from '../images/about/processing/newfacility.png';

export default () => (
    <AppOverflow>
        <AppGrid title="How OAR Facilities Are Created And Matched">
            <Grid container className="margin-bottom-64">
                <Grid item xs={12}>
                    <h2 id="Introduction">Introduction</h2>

                    <p>
                        The list of searchable facilities in the Open Apparel
                        Registry (OAR) is compiled from lists submitted by
                        contributors. The application uses statistical text
                        analysis to compare newly submitted items to the
                        existing list of facilities in an attempt to
                        automatically match highly similar items. Where the
                        similarities between items are weaker, the application
                        will present a potential match, requiring confirmation
                        from the contributor / user.
                    </p>

                    <h2 id="Uploading-a-list">Uploading a list</h2>

                    <p>
                        Contributors submit their facility lists to the OAR for
                        processing by uploading lists in Microsoft Excel (XLS or
                        XLSX) or comma-separated value (CSV) format. All popular
                        spreadsheet programs support at least one of these
                        formats. The OAR provides a downloadable CSV template,
                        but any Excel or CSV can be read and processed if it
                        meets the following criteria:
                    </p>

                    <ul>
                        <li>
                            Includes a header row with the following field names
                            (in lowercase)
                            <ul>
                                <li>country</li>
                                <li>name</li>
                                <li>address</li>
                            </ul>
                        </li>
                        <li>
                            Has facility rows made up of comma separated
                            country, name, and address fields. All the fields
                            for each facility must be on a single line.
                            Additional fields are allowed, but they will be
                            ignored.
                        </li>
                        <li>Less than 5MB in size.</li>
                    </ul>

                    <p>
                        Excel files should have only one sheet and no empty
                        cells before the data starts.
                    </p>

                    <h2 id="Processing">Processing</h2>

                    <p>
                        Each line in a contributed facility list file is
                        processed separately and passes through three steps:
                    </p>

                    <h3 id="Parse">Parse</h3>

                    <p>
                        The line is separated into distinct country, name, and
                        address fields and the country field is verified against
                        a list of known countries.
                    </p>

                    <h3 id="Geocode">Geocode</h3>

                    <p>
                        The address and country are submitted to a service that
                        returns a location on the globe corresponding to that
                        country and address. This allows the application to show
                        the location of the facility on a map.
                    </p>

                    <h3 id="Match">Match</h3>

                    <p>
                        The country, name, and address are compared to the list
                        of known OAR facilities.
                    </p>

                    <ul>
                        <li>
                            <p>
                                If the country, name, and address are
                                confidently matched to an existing facility then
                                that match is recorded. The facility details
                                page will show a link to contributor and show
                                the submitted name and address as alternate
                                versions of the facility name and address.
                            </p>

                            <p>
                                <img
                                    src={matched}
                                    alt="Matched"
                                    style={{ width: '100%' }}
                                />
                            </p>
                        </li>

                        <li>
                            <p>
                                If one or more potential matches to an existing
                                facility are found, but the application is not
                                confident enough to make the match
                                automatically, the contributor will be asked to
                                &ldquo;Confirm&rdquo; or &ldquo;Reject&rdquo;
                                the match using buttons within the application.
                            </p>

                            <p>
                                <img
                                    src={confirm}
                                    alt="Confirm"
                                    style={{ width: '100%' }}
                                />
                            </p>
                        </li>

                        <li>
                            <p>
                                If no potential matches to any existing facility
                                are found, the application creates a new
                                facility using the country, name, and address
                                and assigns a new OAR ID number to the new
                                facility.
                            </p>

                            <p>
                                <img
                                    src={newfacility}
                                    alt="New Facility"
                                    style={{ width: '100%' }}
                                />
                            </p>
                        </li>
                    </ul>

                    <h2 id="The-matching-logic">The matching logic</h2>

                    <p>
                        Contributed rows are matched to the existing facility
                        list using statistical text analysis. The application
                        calculates the probability that a contributed row is a
                        match to an existing facility by comparing the country,
                        name, and address fields individually and then joining
                        those three comparisons together to create a final
                        confidence score. The three individual comparisons are
                        not given equal weight, however. The country of a
                        submitted row, for example, must be an exact match.
                    </p>

                    <h2 id="Training-the-algorithm">Training the algorithm</h2>

                    <p>
                        The application has a set of example apparel facility
                        names and addresses that are used to &ldquo;train&rdquo;
                        the matching process. There are examples of similar
                        items that should not be considered matches as well as
                        examples of dissimilar items that should be considered
                        matches. Using this training data allows the application
                        to mathematically determine which differences in the
                        text of facility name or address are significant and
                        which are not.
                    </p>

                    <p>
                        Some categories of text differences are filtered out
                        before the statistical matching process takes place.
                        These items <em>do not</em> affect whether a contributed
                        row is a match to an existing facility:
                    </p>

                    <ul>
                        <li>Capitalization</li>
                        <li>Extra whitespace characters between words</li>
                        <li>
                            The presence or absence of the following punctuation
                            characters - / , : '
                        </li>
                    </ul>

                    <h2 id="Common-Questions">Common Questions</h2>

                    <blockquote>
                        <p>
                            Why are only some of the facilities from my list
                            appearing in searches?
                        </p>
                    </blockquote>

                    <p>
                        Each row from a contributed file is processed
                        separately. Rows that are matched successfully or rows
                        from which new OAR facilities are created will appear in
                        searches immediately after processing. If the
                        application requires the contributor to verify a
                        potential match, the facility will not be searchable
                        until the match is approved or rejected. If the
                        application encounters an error while processing a row,
                        it will not appear in search results.
                    </p>

                    <blockquote>
                        <p>
                            One of the items in my list has an
                            &ldquo;ERROR&rdquo; status. How can I tell what
                            happened?
                        </p>
                    </blockquote>

                    <p>
                        When viewing the list, clicking on a row in an
                        &ldquo;ERROR&rdquo; status will show additional
                        information regarding why the processing failed.
                    </p>

                    <blockquote>
                        <p>
                            How long will it take to process my contributed
                            facility list?
                        </p>
                    </blockquote>

                    <p>
                        List items are scheduled for processing as soon as they
                        are uploaded, but it is difficult to say with certainty
                        how long it will take to complete the processing. The
                        size of the list and the number of other lists being
                        processed at the same time will affect how long it will
                        take to complete the processing of all the items in a
                        list. If all the items in a contributed list still have
                        the initial status of &ldquo;UPLOADED&rdquo; after one
                        hour, please send an email to{' '}
                        <a href="mailto:info@openapparel.org">
                            info@openapparel.org
                        </a>{' '}
                        with the contributor name and the name of the list and
                        the team will investigate the issue and get back to you.
                    </p>

                    <blockquote>
                        <p>
                            What happens when I &ldquo;Confirm&rdquo; or
                            &ldquo;Reject&rdquo; a potential facility match?
                        </p>
                    </blockquote>

                    <p>
                        If one of the potential matches is confirmed, that match
                        is recorded by the application. The details page for the
                        matched facility will show a link to your contributor
                        page and show the submitted name and address as
                        alternate versions of the facility name and address.
                        Only one match can be confirmed for any given row, so
                        all other potential matches will be rejected
                        automatically.
                    </p>

                    <p>
                        If all the potential matches are rejected, the
                        application will create a new facility using the
                        country, name, and address from the row and assign the
                        facility a new OAR ID.
                    </p>

                    <blockquote>
                        <p>What is an OAR ID and how is it created?</p>
                    </blockquote>

                    <p>
                        The OAR ID is a 15-character unique identifier assigned
                        to each facility in the Open Apparel Registry. Here is
                        an example OAR ID.
                    </p>

                    <p>
                        <code>CN2019067NZ95AM</code>
                    </p>

                    <p>The ID is made up of 4 segments:</p>

                    <p>
                        <code>CN 2019067 NZ95A M</code>
                    </p>

                    <p>From left to right these segment are:</p>

                    <ul>
                        <li>A 2-character country code.</li>
                        <li>
                            The 4-digit year and 3-digit day of the year
                            indicating when the OAR ID was assigned.
                        </li>
                        <li>5 characters that represent a random number.</li>
                        <li>
                            A one character &ldquo;check digit&rdquo; that is
                            calculated based on the previous 14 characters and
                            can be used to validate that an OAR ID has not been
                            mistyped or otherwise damaged.
                        </li>
                    </ul>
                </Grid>
            </Grid>
        </AppGrid>
    </AppOverflow>
);
