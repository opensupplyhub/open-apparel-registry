import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import MaterialButton from '@material-ui/core/Button';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import { DownloadCSV } from '../util/util';
import AppGrid from '../components/AppGrid';
import ControlledTextInput from '../components/ControlledTextInput';
import Button from '../components/Button';
import ShowOnly from '../components/ShowOnly';
import COLOURS from '../util/COLOURS';

const styles = {
    fileNameText: {
        color: COLOURS.LIGHT_BLUE,
        fontSize: '12px',
        display: 'block',
        marginTop: '8px',
        fontStyle: 'italic',
    },
    backToMap: {
        textDecoration: 'none',
        fontFamily: 'Roboto',
        fontWeight: 500,
        color: COLOURS.NAVY_BLUE,
    },
    link: {
        color: COLOURS.NAVY_BLUE,
    },
};

const mapStateToProps = state => ({
    user: state.user,
});

const mapDispatchToProps = () => ({
    actions: {},
});

class Contribute extends Component {
    state = {
        description: '',
        fileName: '',
        fileDisplayName: '',
        success: false,
        isSpinning: false,
        ifHasSpecialChar: false,
    };

    setSpin = spin => this.setState({ isSpinning: spin });

    selectFile = () => this.fileInput.click();

    fileChosen = () => {
        if (
            !this.fileInput.files ||
            !this.fileInput.files[0] ||
            !this.fileInput.files[0].name
        ) { return; }
        this.setState({ fileName: this.fileInput.files[0].name });
    };

    uploadSuccess = () => {
        this.setState({ success: true, isSpinning: false });
        toast('Your factory has successfully been uploaded!');
    };

    uploadFile = () => {
        this.setSpin(true);
        const {
            user,
            actions: { uploadFactoriesListToUrsa },
        } = this.props;
        const { fileDisplayName, description } = this.state;
        const reader = new FileReader();
        if (this.fileInput.files && this.fileInput.files[0]) {
            if (this.fileInput.files[0].size / 1024 / 1024 < 5) {
                reader.readAsText(this.fileInput.files[0]);
                reader.onload = event =>
                    uploadFactoriesListToUrsa(
                        user,
                        event.target.result,
                        fileDisplayName,
                        description,
                        this.uploadSuccess,
                        this.setSpin,
                    );
            } else {
                toast('File too large. Please make it be less than 5 MB');
                this.setSpin(false);
            }
        } else {
            toast('No file selected');
            this.setSpin(false);
        }
    };

    fieldUpdated = field => (event) => {
        const attribute = {};
        attribute[field] = event.target.value;

        this.setState(attribute);

        if (field === 'fileDisplayName') {
            const ifHasSpecialChar = this.checkIfHasSpecialChar(event.target.value);
            this.setState({ ifHasSpecialChar });
        }
    };

    checkIfHasSpecialChar = (inputStr) => {
        if (inputStr && inputStr.match(/[^a-zA-Z0-9 ]/g)) return true;
        return false;
    };

    render() {
        const {
            fileName,
            description,
            fileDisplayName,
            success,
            isSpinning,
            ifHasSpecialChar,
        } = this.state;
        const csvTemplate = 'country,name,address\nEgypt,Elite Merchandising Corp.,St. 8 El-Amrya Public Free Zone Alexandria Iskandariyah 23512 Egypt';

        return (
            <AppGrid title="Contribute">
                <Grid container className="margin-bottom-64">
                    <Grid item xs={12}>
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
                                        <strong>CSV UTF-8 (.csv)</strong>
                                    </li>
                                </ul>
                                <MaterialButton
                                    disableRipple
                                    variant="outlined"
                                    color="primary"
                                    className="outlined-button"
                                    onClick={() =>
                                        DownloadCSV(
                                            csvTemplate,
                                            'OAR_Contributor_Template',
                                        )
                                    }
                                >
                                    Download OAR Contributor Template
                                </MaterialButton>
                            </div>
                        </div>

                        <div className="control-panel__group">
                            <div className="form__field">
                                <p className="form__label">
                                    Enter the organization name for this
                                    facility list
                                </p>
                                <ControlledTextInput
                                    type="text"
                                    hint="Use only letters (a-z) or numbers (0-9), e.g, Alpha Brand Facility List June 2018"
                                    placeholder="Facility List Name"
                                    onChange={this.fieldUpdated('fileDisplayName')}
                                    value={fileDisplayName}
                                />
                                {ifHasSpecialChar && (
                                    <p className="form__error">
                                        Use only letters (a-z, A-Z) and numbers
                                        (0-9).
                                    </p>
                                )}
                            </div>
                            <div className="form__field">
                                <p className="form__label">
                                    Enter a description of this facility list
                                    and include a timeframe for the list&rsquo;s
                                    validity
                                </p>
                                <ControlledTextInput
                                    type="text"
                                    hint="Use only letters (a-z) or numbers (0-9), e.g. This is the Alpha Brand list of suppliers for their apparel products valid from June 2018 to Sept 2018"
                                    placeholder="Facility List Description"
                                    onChange={this.fieldUpdated('description')}
                                    value={description}
                                />
                            </div>
                            <div className="form__field">
                                <MaterialButton
                                    onClick={this.selectFile}
                                    type="button"
                                    variant="outlined"
                                    color="primary"
                                    className="outlined-button"
                                    disableRipple
                                >
                                    Select Facility List File
                                </MaterialButton>
                                <p style={styles.fileNameText}>{fileName}</p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    ref={(c) => { this.fileInput = c; }}
                                    style={{
                                        display: 'none',
                                        visibility: 'hidden',
                                    }}
                                    onChange={this.fileChosen}
                                />
                            </div>
                            <div className="form__field">
                                {isSpinning ? (
                                    <CircularProgress size={30} />
                                ) : (
                                    <Button
                                        onClick={this.uploadFile}
                                        disabled={
                                            !fileDisplayName ||
                                            !description ||
                                            !fileName ||
                                            ifHasSpecialChar
                                        }
                                        text="SUBMIT"
                                        variant="contained"
                                        disableRipple
                                    >
                                        SUBMIT
                                    </Button>
                                )}
                                <ShowOnly when={success}>
                                    <p style={styles.fileNameText}>
                                        Your facility list has been successfully
                                        uploaded !
                                    </p>
                                </ShowOnly>
                            </div>
                            <div className="form__field">
                                <p className="form__label">
                                    Once the list has been successfully
                                    uploaded, view your list and confirm or deny
                                    matches.
                                </p>
                            </div>
                            <div className="form__field">
                                <Link
                                    to="/lists"
                                    href="/lists"
                                    className="outlined-button outlined-button--link margin-top-16"
                                >
                                    View My Lists
                                </Link>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <div className="control-panel__group margin-bottom-64">
                            <div className="form__field">
                                <p className="form__label">
                                    Troubleshooting Common Issues
                                </p>
                                <ul className="helper-list">
                                    <li className="helper-list__item">
                                        Check that you have not changed the
                                        column titles in the CSV template,
                                        switched the order of the columns, or
                                        added any additional columns.
                                    </li>
                                    <li className="helper-list__item">
                                        Check that you do not have any blank
                                        cells in the country, name, or address
                                        columns, or any merged cells in your
                                        CSV.
                                    </li>
                                    <li className="helper-list__item">
                                        Check that you have not used any special
                                        characters in the name of your CSV file,
                                        the title of your list, or the
                                        description of your list. e.g. dashes
                                        (-), underscores (_), forward (/) or
                                        backward slashes (\), apostrophes (‘),
                                        commas (,) or full stops (.)
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
                </Grid>
            </AppGrid>
        );
    }
}

Contribute.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Contribute);
