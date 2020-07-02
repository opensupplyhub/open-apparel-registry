import React, { Fragment, memo } from 'react';
import MaterialButton from '@material-ui/core/Button';

const ContributeHeader = memo(() => (
    <Fragment>
        <div className="control-panel__group">
            <div className="form__field">
                <p className="form__label">
                    Download the OAR Contributor Template and
                    copy and paste your list into the template.
                </p>
                <ul className="helper-list">
                    <li className="helper-list__item">
                        Do not change the column heading titles
                        in the first row.
                    </li>
                    <li className="helper-list__item">
                        Your list should only contain production
                        facilities, not office addresses or
                        headquarters. This can include
                        dyehouses, mills, laundries, cut and
                        sew, RMG, embellishments and printing.
                    </li>
                    <li className="helper-list__item">
                        All fields in your list must be in English but may
                        include accented or other Unicode characters. Individual
                        fields must separated with commas.
                    </li>
                    <li className="helper-list__item">
                        File size limit: 5MB
                    </li>
                    <li className="helper-list__item">
                        Save your file as an{' '}
                        <strong>
                            Excel file (.xls, .xlsx)
                        </strong>
                        {' '}or as a{' '}
                        <strong>
                            CSV UTF-8 (.csv)
                        </strong>
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
                        Download Excel (XLSX) Template
                    </MaterialButton>
                    <MaterialButton
                        disableRipple
                        variant="outlined"
                        color="primary"
                        className="outlined-button"
                        href="/contributor-templates/OAR_Contributor_Template.csv"
                    >
                        Download CSV Template
                    </MaterialButton>
                </div>
                <div style={{ margin: '20px 0' }}>
                    <MaterialButton
                        disableRipple
                        variant="outlined"
                        color="primary"
                        className="outlined-button outlined-button--inline"
                        href="/contributor-templates/OAR_Contributor_Template_With_PPE.xlsx"
                    >
                        Download Excel (XLSX) Template With PPE Columns
                    </MaterialButton>
                    <MaterialButton
                        disableRipple
                        variant="outlined"
                        color="primary"
                        className="outlined-button"
                        href="/contributor-templates/OAR_Contributor_Template_With_PPE.csv"
                    >
                        Download CSV Template With PPE Columns
                    </MaterialButton>
                </div>
            </div>
        </div>
    </Fragment>
));

export default ContributeHeader;
