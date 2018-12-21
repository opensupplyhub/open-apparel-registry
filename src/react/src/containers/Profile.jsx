import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import ReactFilestack from 'filestack-react';
import PropTypes from 'prop-types';
import Button from '../components/Button';
import TextInput from '../components/inputs/TextInput';
import SelectInput from '../components/inputs/SelectInput';
import * as userActions from '../actions/user';
import COLOURS from '../util/COLOURS';
import AppGrid from './AppGrid';
import ShowOnly from '../components/ShowOnly';
import APIkey from '../components/APIkey';
import '../styles/css/specialStates.css';
import '../styles/css/filestack.css';

const contributorTypeOptions = [
    'Auditor',
    'Brand/Retailer',
    'Civil Society Organization',
    'Factory / Facility',
    'Manufacturing Group / Supplier / Vendor',
    'Multi Stakeholder Initiative',
    'Researcher / Academic',
    'Service Provider',
    'Union',
    'Other',
];

const mapStateToProps = state => ({
    user: state.user,
    source: state.source,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(userActions, dispatch),
});

const styles = {
    logoContainer: {
        width: '200px',
        height: '200px',
        borderRadius: '100%',
        border: '1px solid',
        borderColor: COLOURS.GREY,
        display: 'inline-block',
        marginBottom: '20px',
    },
    logoSpacer: {
        width: '170px',
        height: '170px',
        marginLeft: '15px',
        marginTop: '15px',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: '100%',
    },
};

class Profile extends Component {
    state = {
        email: '',
        name: '',
        description: '',
        contributorType: '',
        otherContributor: '',
        website: '',
        photo: '',
        nameOrTypeUpdated: false,
        recentList: {},
    };

    componentWillMount() {
        this.setUserData(this.props);
        this.getRecentList();
    }

    componentDidUpdate({
        match: {
            params: { id },
        },
    }) {
        const {
            match: {
                params: { id: propsId },
            },
        } = this.props;
        if (id !== propsId) {
            this.setUserData(this.props);
        }
    }

    setUserData = (props) => {
        const requestedUid = props.match.params.id;

        if (props.user && props.user.uid === requestedUid) {
            this.setState(this.props.user);
        } else {
            props.actions.loadSelectedUser(requestedUid, user =>
                this.setState(user));
        }
    };

    getRecentList = () => {
        const { source } = this.props.source;
        const targetSource = source.find(s => s.uid === this.props.match.params.id);
        let recentList;
        if (targetSource) recentList = targetSource.list;
        if (recentList && recentList.file_name) {
            const splitC = recentList.file_name.split('_');
            const timeStamp = splitC.pop();
            const formatTime = new Date(Number(timeStamp)).toLocaleDateString();
            recentList.displayName = `${splitC}_${formatTime}`;
            this.setState({ recentList });
        }
    };

    saveChanges = () => {
        const { nameOrTypeUpdated, ...user } = this.state;
        this.props.actions.updateUser(user, nameOrTypeUpdated);
    };

    updateInputField = field => (event) => {
        const attribute = {};
        attribute[field] = event.target.value;

        this.setState(attribute);

        if (field === 'name' || field === 'contributorType') { this.setState({ nameOrTypeUpdated: true }); }
    };

    formValid = () =>
        ['name', 'description', 'contributorType', 'password', 'email'].every(key => this.state[key]);

    uploadPhotoSuccess = ({ filesUploaded }) => {
        if (filesUploaded.length) {
            this.props.actions.updateProfilePhoto(filesUploaded[0].url);
        }
    };

    render() {
        const {
            email,
            name,
            description,
            website,
            photo,
            recentList,
            contributorType,
            otherContributor,
        } = this.state;
        const isUser =
            this.props.user &&
            this.props.user.uid === this.props.match.params.id;

        return (
            <AppGrid
                title={isUser ? 'My Profile' : 'Profile'}
                style={{
                    justifyContent: 'space-between',
                    marginBottom: '100px',
                }}
            >
                <Grid item xs={12} sm={7}>
                    <ShowOnly if={isUser}>
                        <div className="control-panel__group">
                            <div className="form__field">
                                <p className="form__label">Email Address</p>
                                <TextInput
                                    type="email"
                                    placeholder="Email Address"
                                    onChange={this.updateInputField('email')}
                                    value={email}
                                    disabled
                                />
                            </div>
                        </div>
                    </ShowOnly>
                    <div className="control-panel__group">
                        <div className="form__field">
                            <p className="form__label">Name</p>
                            <TextInput
                                placeholder="Name"
                                onChange={this.updateInputField('name')}
                                value={name}
                                disabled={!isUser}
                            />
                        </div>
                    </div>
                    <div className="control-panel__group">
                        <div className="form__field">
                            <p className="form__label">Description</p>
                            <TextInput
                                placeholder="Description"
                                onChange={this.updateInputField('description')}
                                value={description}
                                disabled={!isUser}
                            />
                        </div>
                    </div>
                    <div className="control-panel__group">
                        <div className="form__field">
                            <p className="form__label">Contributor Type</p>
                            <SelectInput
                                disabled={!isUser}
                                onChange={this.updateInputField('contributorType')}
                                options={contributorTypeOptions}
                                placeholder=""
                                initialValue={contributorType}
                            />
                            <ShowOnly if={contributorType === 'Other'}>
                                <p className="form__label">
                                    Other Contributor Type
                                </p>
                                <TextInput
                                    value={otherContributor}
                                    disabled={!isUser}
                                    placeholder="Please specify"
                                    onChange={this.updateInputField('otherContributor')}
                                />
                            </ShowOnly>
                        </div>
                    </div>
                    <div className="control-panel__group">
                        <div className="form__field">
                            <p className="form__label">Website</p>
                            <TextInput
                                placeholder="Website"
                                onChange={this.updateInputField('website')}
                                value={website}
                                disabled={!isUser}
                            />
                        </div>
                    </div>
                    {recentList && recentList.displayName && (
                        <div className="control-panel__group">
                            <div className="form__field">
                                <p className="form__label">Most Recent List</p>
                                <TextInput
                                    placeholder="Most Recent List"
                                    value={recentList.displayName}
                                    disabled
                                />
                            </div>
                        </div>
                    )}
                    {recentList && recentList.file_description && (
                        <div className="control-panel__group">
                            <div className="form__field">
                                <p className="form__label">List Description</p>
                                <TextInput
                                    placeholder="List Description"
                                    value={recentList.file_description}
                                    disabled
                                />
                            </div>
                        </div>
                    )}
                    {isUser ? (
                        <React.Fragment>
                            <div className="control-panel__group">
                                <div className="form__field">
                                    <p className="form__label">
                                        Confirm current password to save changes
                                    </p>
                                    <TextInput
                                        type="password"
                                        placeholder="Current password"
                                        onChange={this.updateInputField('password')}
                                        disabled={!isUser}
                                    />
                                </div>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    marginBottom: '35px',
                                }}
                            >
                                <Button
                                    text="Save Changes"
                                    onClick={this.saveChanges}
                                    disabled={!this.formValid()}
                                    color="primary"
                                    variant="contained"
                                    disableRipple
                                >
                                    Save Changes
                                </Button>
                            </div>
                            <APIkey uid={this.props.user.uid} />
                        </React.Fragment>
                    ) : (
                        <Link
                            to="/"
                            className="outlined-button outlined-button--link"
                        >
                            BACK TO MAP
                        </Link>
                    )}
                </Grid>
                <Grid item xs={12} sm={3} style={{ textAlign: 'center' }}>
                    <div style={styles.logoContainer}>
                        <div style={styles.logoSpacer}>
                            <img
                                src={isUser ? this.props.user.photo : photo}
                                style={styles.image}
                                alt=""
                            />
                        </div>
                    </div>
                    <ShowOnly if={isUser}>
                        <ReactFilestack
                            apikey={process.env.REACT_APP_FILESTACK_KEY}
                            buttonText="Change Profile Photo"
                            buttonClass="uploadButton"
                            onSuccess={this.uploadPhotoSuccess}
                            options={{
                                transformations: {
                                    crop: { aspectRatio: 1, force: true },
                                },
                                maxFiles: 1,
                                minFiles: 1,
                                accept: 'image/*',
                                fromSources: ['local_file_system'],
                            }}
                        />
                    </ShowOnly>
                </Grid>
            </AppGrid>
        );
    }
}

Profile.propTypes = {
    match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    user: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    source: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

Profile.defaultProps = {
    user: {},
    source: { source: [] },
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Profile);
