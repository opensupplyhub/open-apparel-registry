import React, { Fragment, memo } from 'react';
import MaterialButton from '@material-ui/core/Button';

import { downloadContributorTemplate } from '../util/util';

const ContributeHeader = memo(() => (
    <Fragment>
        <p>
            To contribute your supplier list to the OAR, please
            complete the following steps:
        </p>
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
                        File size limit: 5MB
                    </li>
                    <li className="helper-list__item">
                        Save your file as a CSV file:{' '}
                        <strong>
                            CSV UTF-8 (.csv)
                        </strong>
                    </li>
                </ul>
                <MaterialButton
                    disableRipple
                    variant="outlined"
                    color="primary"
                    className="outlined-button"
                    onClick={downloadContributorTemplate}
                >
                    Download OAR Contributor Template
                </MaterialButton>
            </div>
        </div>
    </Fragment>
));

export default ContributeHeader;
