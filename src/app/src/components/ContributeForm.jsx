import React, { Component } from 'react';
import { arrayOf, bool, func, number, string } from 'prop-types';
import { connect } from 'react-redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import MaterialButton from '@material-ui/core/Button';
import { toast } from 'react-toastify';

import ControlledTextInput from './ControlledTextInput';
import Button from './Button';
import ContributeFormSelectListToReplace from './ContributeFormSelectListToReplace';

import COLOURS from '../util/COLOURS';

import {
    getValueFromEvent,
    getFileFromInputRef,
    getFileNameFromInputRef,
} from '../util/util';

import {
    contributeFormFields,
    contributeFieldsEnum,
} from '../util/constants';

import {
    updateFileUploadName,
    updateFileUploadDescription,
    updateFileUploadFileName,
    updateFileUploadListToReplaceID,
    uploadFile,
    resetUploadState,
} from '../actions/upload';

import {
    fetchUserFacilityLists,
    resetUserFacilityLists,
} from '../actions/facilityLists';

import { facilityListPropType } from '../util/propTypes';

const contributeFormStyles = Object.freeze({
    fileNameText: Object.freeze({
        color: COLOURS.LIGHT_BLUE,
        fontSize: '12px',
        display: 'block',
        marginTop: '8px',
        fontStyle: 'italic',
    }),
    fileInputHidden: Object.freeze({
        display: 'none',
        visibility: 'hidden',
    }),
    postErrorHelp: Object.freeze({
        margin: '1.5rem 0',
        fontWeight: 500,
    }),
});

class ContributeForm extends Component {
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
    }

    componentDidMount() {
        return this.props.fetchLists();
    }

    componentDidUpdate({ fetching: wasFetching }) {
        const {
            fetching,
            error,
        } = this.props;

        if (fetching) {
            return null;
        }

        if (error) {
            return null;
        }

        if (!wasFetching) {
            return null;
        }

        this.props.fetchLists();
        this.fileInput.current.value = null;
        return toast('Your facility list has been uploaded successfully!');
    }

    componentWillUnmount() {
        return this.props.resetForm();
    }

    selectFile = () => this.fileInput.current.click();

    updateSelectedFileName = () => this.props.updateFileName(this.fileInput);

    handleUploadList = () => this.props.uploadList(this.fileInput);

    render() {
        const {
            name,
            description,
            filename,
            replaces,
            fetching,
            error,
            updateName,
            updateDescription,
            updateListToReplace,
            fetchingFacilityLists,
            facilityLists,
        } = this.props;


        const errorMessages = error && error.length
            ? (
                <React.Fragment>
                    <ul>
                        {
                            error
                                .map(err => (
                                    <li
                                        key={err}
                                        style={{ color: 'red' }}
                                    >
                                        {err}
                                    </li>))
                        }
                    </ul>
                    <div style={contributeFormStyles.postErrorHelp}>
                        If you continue to have trouble submitting your list, please check
                        the <a href="#troubleshooting">troubleshooting</a> section
                        on this page or email <a href="mailto:info@openapparel.org">info@openapparel.org</a>.
                    </div>
                </React.Fragment>
            )
            : null;

        const formInputs = contributeFormFields
            .map(field => (
                <div
                    key={field.id}
                    className="form__field"
                >
                    <label
                        htmlFor={field.id}
                        className="form__label"
                    >
                        {field.label}
                    </label>
                    <ControlledTextInput
                        id={field.id}
                        type={field.type}
                        hint={field.hint}
                        placeholder={field.placeholder}
                        onChange={
                            field.id === contributeFieldsEnum.name
                                ? updateName
                                : updateDescription
                        }
                        value={
                            field.id === contributeFieldsEnum.name
                                ? name
                                : description
                        }
                    />
                </div>));

        const submitButtonIsDisabled = (fetching || fetchingFacilityLists);

        const replacesSection = facilityLists && facilityLists.length
            ? (
                <ContributeFormSelectListToReplace
                    lists={facilityLists}
                    replaces={replaces}
                    handleChange={updateListToReplace}
                />)
            : null;

        return (
            <div className="control-panel__group">
                {formInputs}
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
                    <p style={contributeFormStyles.fileNameText}>
                        {filename}
                    </p>
                    <input
                        type="file"
                        accept=".csv"
                        ref={this.fileInput}
                        style={contributeFormStyles.fileInputHidden}
                        onChange={this.updateSelectedFileName}
                    />
                </div>
                {replacesSection}
                <div className="form__field">
                    {errorMessages}
                    {
                        fetching
                            ? <CircularProgress size={30} />
                            : (
                                <Button
                                    onClick={this.handleUploadList}
                                    disabled={submitButtonIsDisabled}
                                    text="SUBMIT"
                                    variant="contained"
                                    disableRipple
                                >
                                    SUBMIT
                                </Button>)
                    }
                </div>
            </div>
        );
    }
}

ContributeForm.defaultProps = {
    error: null,
};

ContributeForm.propTypes = {
    name: string.isRequired,
    description: string.isRequired,
    filename: string.isRequired,
    replaces: number.isRequired,
    fetching: bool.isRequired,
    error: arrayOf(string),
    updateName: func.isRequired,
    updateDescription: func.isRequired,
    updateFileName: func.isRequired,
    updateListToReplace: func.isRequired,
    uploadList: func.isRequired,
    facilityLists: arrayOf(facilityListPropType).isRequired,
    fetchingFacilityLists: bool.isRequired,
    fetchLists: func.isRequired,
    resetForm: func.isRequired,
};

function mapStateToProps({
    upload: {
        form: {
            name,
            description,
            filename,
            replaces,
        },
        fetching,
        error,
    },
    facilityLists: {
        facilityLists,
        fetching: fetchingFacilityLists,
    },
}) {
    return {
        name,
        description,
        filename,
        replaces,
        fetching,
        error,
        facilityLists,
        fetchingFacilityLists,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        updateName: e => dispatch(updateFileUploadName(getValueFromEvent(e))),
        updateDescription: e => dispatch(updateFileUploadDescription(getValueFromEvent(e))),
        updateFileName: r => dispatch(updateFileUploadFileName(getFileNameFromInputRef(r))),
        updateListToReplace: e =>
            dispatch(updateFileUploadListToReplaceID(getValueFromEvent(e))),
        uploadList: r => dispatch(uploadFile(getFileFromInputRef(r))),
        fetchLists: () => dispatch(fetchUserFacilityLists()),
        resetForm: () => {
            dispatch(resetUserFacilityLists());
            return dispatch(resetUploadState());
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContributeForm);
