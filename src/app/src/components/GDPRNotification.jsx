import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from './Button';
import ShowOnly from './ShowOnly';
import COLOURS from '../util/COLOURS';
import CookiePreferencesText from './CookiePreferencesText';

import {
    userHasAcceptedOrRejectedGATracking,
    userHasAcceptedGATracking,
    acceptGATrackingAndStartTracking,
    rejectGATracking,
    startGATrackingIfUserHasAcceptedNotification,
} from '../util/util.ga';

export default class GDPRNotification extends Component {
    state = { open: false };

    componentDidMount() {
        if (userHasAcceptedOrRejectedGATracking()) {
            if (userHasAcceptedGATracking()) {
                startGATrackingIfUserHasAcceptedNotification();
            }

            return null;
        }

        return this.setState(state =>
            Object.assign({}, state, {
                open: true,
            }),
        );
    }

    acceptGDPRAlertAndDismissSnackbar = () =>
        this.setState(
            state => Object.assign({}, state, { open: false }),
            acceptGATrackingAndStartTracking,
        );

    rejectGDPRAlertAndDismissSnackbar = () =>
        this.setState(
            state => Object.assign({}, state, { open: false }),
            rejectGATracking,
        );

    render() {
        const GDPRActions = (
            <div>
                <Button
                    text="Reject"
                    style={{
                        background: COLOURS.LIGHT_BLUE,
                        marginRight: '10px',
                    }}
                    onClick={this.rejectGDPRAlertAndDismissSnackbar}
                />
                <Button
                    text="Accept"
                    onClick={this.acceptGDPRAlertAndDismissSnackbar}
                />
            </div>
        );

        return (
            <ShowOnly when={this.state.open}>
                <Snackbar
                    className="gdpr-notification"
                    open={this.state.open}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    action={GDPRActions}
                    message={<CookiePreferencesText />}
                />
            </ShowOnly>
        );
    }
}
