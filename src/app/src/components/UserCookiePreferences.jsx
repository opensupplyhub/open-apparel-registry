import React, { Component } from 'react';

import Divider from '@material-ui/core/Divider';

import COLOURS from '../util/COLOURS';
import Button from './Button';
import CookiePreferencesText from './CookiePreferencesText';

import {
    userHasAcceptedGATracking,
    acceptGATrackingAndStartTracking,
    rejectGATracking,
    clearGATrackingDecision,
} from '../util/util.ga';

const componentStyles = Object.freeze({
    header: Object.freeze({
        padding: '0 1rem',
    }),
    content: Object.freeze({
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
    }),
    buttons: Object.freeze({
        padding: '2rem 0',
        display: 'flex',
        justifyContent: 'flex-end',
    }),
});

class UserCookiePreferences extends Component {
    state = {
        accepted: userHasAcceptedGATracking(),
    }

    acceptGDPRAlert = () => this.setState(
        state => Object.assign({}, state, { accepted: true }),
        () => {
            clearGATrackingDecision();
            acceptGATrackingAndStartTracking();
        },
    );

    rejectGDPRAlert = () => this.setState(
        state => Object.assign({}, state, { accepted: false }),
        () => {
            clearGATrackingDecision();
            rejectGATracking();
        },
    );

    render() {
        return (
            <div className="margin-bottom">
                <Divider />
                <h3 style={componentStyles.header}>
                    Cookie Preferences
                </h3>
                <div style={componentStyles.content}>
                    <CookiePreferencesText />
                    <div style={componentStyles.buttons}>
                        {this.state.accepted && (
                            <Button
                                text="Reject"
                                style={{ background: COLOURS.LIGHT_BLUE }}
                                onClick={this.rejectGDPRAlert}
                            />
                        )}
                        {!this.state.accepted && (
                            <Button
                                text="Accept"
                                onClick={this.acceptGDPRAlert}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default UserCookiePreferences;
