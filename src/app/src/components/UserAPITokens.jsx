import React, { Component } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, string } from 'prop-types';

import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import UserAPITokenListItem from './UserAPITokenListItem';

import {
    fetchAPIToken,
    deleteAPIToken,
    createAPIToken,
} from '../actions/profile';

import { tokenPropType } from '../util/propTypes';

const componentStyles = Object.freeze({
    header: Object.freeze({
        padding: '0 1rem',
    }),
    generateTokenButton: Object.freeze({
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'flex-end',
    }),
});

class UserAPITokens extends Component {
    state = {
        deleteDialogOpen: false,
    };

    componentDidMount() {
        return this.props.getTokens();
    }

    closeDialog = () =>
        this.setState(state =>
            Object.assign({}, state, { deleteDialogOpen: false }),
        );

    openDialog = () =>
        this.setState(state =>
            Object.assign({}, state, { deleteDialogOpen: true }),
        );

    deleteTokenAndCloseDialog = () => {
        this.props.deleteToken();

        return this.setState(state =>
            Object.assign({}, state, {
                deleteDialogOpen: false,
            }),
        );
    };

    render() {
        const { fetching, error, tokens, createToken } = this.props;

        if (error) {
            window.console.warn(error);
        }

        const insetComponent = tokens.length ? (
            <List>
                {tokens.map(token => (
                    <UserAPITokenListItem
                        key={token.token}
                        token={token}
                        handleDelete={this.openDialog}
                    />
                ))}
            </List>
        ) : (
            <div style={componentStyles.generateTokenButton}>
                <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    disableRipple
                    onClick={createToken}
                    disabled={fetching}
                >
                    Generate a new API token
                </Button>
            </div>
        );

        const deleteTokenDialog = (
            <Dialog
                open={this.state.deleteDialogOpen}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Delete this API token?
                </DialogTitle>
                <DialogContent id="alert-dialog-description">
                    <DialogContentText>
                        This action will irrevocably delete the API token
                        associated with your account.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.closeDialog}
                    >
                        No, do not delete the API token
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={this.deleteTokenAndCloseDialog}
                    >
                        Yes, delete the API token
                    </Button>
                </DialogActions>
            </Dialog>
        );

        return (
            <div className="margin-bottom">
                <Divider />
                <h3 style={componentStyles.header}>API Tokens</h3>
                {insetComponent}
                {deleteTokenDialog}
            </div>
        );
    }
}

UserAPITokens.defaultProps = {
    error: null,
};

UserAPITokens.propTypes = {
    fetching: bool.isRequired,
    error: arrayOf(string),
    tokens: arrayOf(tokenPropType).isRequired,
    createToken: func.isRequired,
    deleteToken: func.isRequired,
    getTokens: func.isRequired,
};

function mapStateToProps({
    profile: {
        tokens: { tokens, fetching, error },
    },
}) {
    return {
        tokens,
        fetching,
        error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createToken: () => dispatch(createAPIToken()),
        deleteToken: () => dispatch(deleteAPIToken()),
        getTokens: () => dispatch(fetchAPIToken()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAPITokens);
