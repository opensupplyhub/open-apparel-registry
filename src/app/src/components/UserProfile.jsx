import React from 'react';
import { bool, shape, string } from 'prop-types';
import { connect } from 'react-redux';

import { userPropType } from '../util/propTypes';

const tempStyle = Object.freeze({
    marginTop: '10%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
});

function UserProfile({
    user,
    fetching,
    match: {
        params: {
            id,
        },
    },
}) {
    if (fetching) {
        return null;
    }

    if (!user) {
        return (
            <div style={tempStyle}>
                <h1>
                    Not logged in
                </h1>
            </div>
        );
    }

    return (
        <div style={tempStyle}>
            <h1>
                Username
            </h1>
            <p>
                {user.email}
            </p>
            <hr />
            <h1>
                User ID
            </h1>
            <p>
                {id}
            </p>
        </div>
    );
}

UserProfile.defaultProps = {
    user: null,
};

UserProfile.propTypes = {
    user: userPropType,
    match: shape({
        params: shape({
            id: string.isRequired,
        }).isRequired,
    }).isRequired,
    fetching: bool.isRequired,
};

function mapStateToProps({
    auth: {
        user: {
            user,
        },
        session: {
            fetching,
        },
    },
}) {
    return {
        user,
        fetching,
    };
}

export default connect(mapStateToProps)(UserProfile);
