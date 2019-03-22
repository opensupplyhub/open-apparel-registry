import React, { memo } from 'react';
import Grid from '@material-ui/core/Grid';

const ContributeTroubleshooting = memo(() => (
    <Grid item xs={12}>
        <div className="control-panel__group margin-bottom-64">
            <div id="troubleshooting" className="form__field">
                <p className="form__label">
                    Troubleshooting Common Issues
                </p>
                <ul className="helper-list">
                    <li className="helper-list__item">
                        Check that your CSV file uses commas to seprate the
                        individual fields, not semcolons, tabs, or other
                        characters.
                    </li>
                    <li className="helper-list__item">
                        Check that you have not changed the
                        column titles in the CSV template.
                        The file must have <code>country</code>
                        , <code>name</code>
                        , and <code>address</code> column titles.
                    </li>
                    <li className="helper-list__item">
                        Check that you do not have any blank
                        cells in the country, name, or address
                        columns, or any merged cells in your
                        CSV.
                    </li>
                    <li>
                        If you are still experiencing issues
                        uploading to the OAR, please{' '}
                        <a
                            href="mailto:info@openapparel.org"
                            className="link-underline"
                        >
                            contact the team
                        </a>
                        .
                    </li>
                </ul>
            </div>
        </div>
    </Grid>
));

export default ContributeTroubleshooting;
