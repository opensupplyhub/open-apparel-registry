import React, { Component } from 'react';
import { connect } from 'react-redux';
import { arrayOf, bool, func, string } from 'prop-types';

import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

import UserAPITokenListItem from './UserAPITokenListItem';

import {
    fetchAPITokens,
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
    componentDidMount() {
        return this.props.getTokens();
    }

    render() {
        const {
            fetching,
            error,
            tokens,
            createToken,
            deleteToken,
        } = this.props;

        if (error) {
            return (
                <div>
                    An error occurred!
                </div>
            );
        }

        return (
            <div className="margin-bottom">
                <Divider />
                <h3 style={componentStyles.header}>
                    API Tokens
                </h3>
                <List>
                    {
                        tokens
                            .map(token => (
                                <UserAPITokenListItem
                                    key={token.id}
                                    token={token}
                                    handleDelete={deleteToken}
                                />))
                    }
                </List>
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
        tokens: {
            tokens,
            fetching,
            error,
        },
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
        deleteToken: token => dispatch(deleteAPIToken(token)),
        getTokens: () => dispatch(fetchAPITokens()),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UserAPITokens);
