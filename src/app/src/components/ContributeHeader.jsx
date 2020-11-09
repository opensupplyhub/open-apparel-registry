import React, { Fragment, memo } from 'react';
import MaterialButton from '@material-ui/core/Button';

import FeatureFlag from './FeatureFlag';
import { PPE } from '../util/constants';

const ContributeHeader = memo(() => (
    <Fragment>
        <div className="control-panel__group">
            <div className="form__field">
                <p className="form__label">
                    Download the OAR Contributor Template and
                    copy and paste your list into the template.
                </p>
                <p>
                    There are two Contributor Template options:
                </p>
                <ol>
                    <li>
                        <strong>Standard template:</strong> this is for all
                        Contributors to the OAR, except for Contributors sharing
                        data on PPE manufacturing
                    </li>
                    <li>
                        <strong>PPE ONLY template:</strong> this is for any
                        Contributor sharing information on PPE manufacturing
                        ONLY and includes columns to specify the type of PPE
                        being manufactured, e.g. scrubs, face masks, visors,
                        gowns etc
                    </li>
                </ol>
                <p className="form__label">
                    Guidance for all uploads
                </p>
                <ul className="helper-list">
                    <li className="helper-list__item">
                        Do not change the column heading titles
                        in the first row.
                    </li>
                    <li className="helper-list__item">
                        Once reviewed for style guidance, delete the row of
                        example facility data.
                    </li>
                    <li className="helper-list__item">
                        The OAR accepts facilities throughout the supply chain,
                        including dyehouses, mills, laundries, cut and sew, RMG,
                        embellishments and printing. The OAR does not accept raw
                        material locations, such as cotton farms or cattle
                        ranches.
                    </li>
                    <li className="helper-list__item">
                        The OAR only accepts apparel facility data. This
                        includes facilities contributing to the production of
                        footwear, accessories, leather goods and home textiles.
                    </li>
                    <li className="helper-list__item">
                        The OAR accepts apparel <strong>production</strong>{' '}
                        facilities. Your list should only contain production
                        facilities, not office addresses or headquarters.
                    </li>
                    <li className="helper-list__item">
                        All fields in your list must be in English but may
                        include accented or other Unicode characters. Individual
                        fields must be separated with commas.
                    </li>
                    <li className="helper-list__item">
                        Country names must be translated into English in order
                        to be recognised by the system.
                    </li>
                    <li className="helper-list__item">
                        File size limit: 5MB
                    </li>
                    <li className="helper-list__item">
                        Save your file as an Excel file (.xls, .xlsx)
                        or as a CSV UTF-8 (.csv)
                    </li>
                    <li className="helper-list__item">
                        Once your upload has been processed, navigate to the “My
                        Lists” section of your account to review the results of
                        the upload. Here you will be able to see any errors in
                        your list, as well as facilities which require you to
                        manually confirm or reject a match with facilities
                        already in the database. For guidance on error messages
                        and the confirm / reject process, see our
                        <a
                            href="https://info.openapparel.org/faq/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >{' '}
                            FAQs
                        </a>.
                    </li>
                </ul>
                <div style={{ margin: '20px 0' }}>
                    <MaterialButton
                        disableRipple
                        variant="outlined"
                        color="primary"
                        className="outlined-button outlined-button--inline"
                        href="/contributor-templates/OAR_Contributor_Template.xlsx"
                    >
                        Download Standard Excel (XLSX) Template
                    </MaterialButton>
                    <MaterialButton
                        disableRipple
                        variant="outlined"
                        color="primary"
                        className="outlined-button"
                        href="/contributor-templates/OAR_Contributor_Template.csv"
                    >
                        Download Standard CSV Template
                    </MaterialButton>
                </div>
                <FeatureFlag flag={PPE}>
                    <div style={{ margin: '20px 0' }}>
                        <MaterialButton
                            disableRipple
                            variant="outlined"
                            color="primary"
                            className="outlined-button outlined-button--inline"
                            href="/contributor-templates/OAR_Contributor_Template_With_PPE.xlsx"
                        >
                            Download PPE (XLSX) Template
                        </MaterialButton>
                        <MaterialButton
                            disableRipple
                            variant="outlined"
                            color="primary"
                            className="outlined-button"
                            href="/contributor-templates/OAR_Contributor_Template_With_PPE.csv"
                        >
                            Download PPE CSV Template
                        </MaterialButton>
                    </div>
                </FeatureFlag>
            </div>
        </div>
    </Fragment>
));

export default ContributeHeader;
