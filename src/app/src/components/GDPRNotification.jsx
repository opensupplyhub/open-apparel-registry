import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from './Button';
import ShowOnly from './ShowOnly';
import COLOURS from '../util/COLOURS';

import {
    userHasAcceptedOrRejectedGATracking,
    acceptGATracking,
    rejectGATracking,
} from '../util/util.ga';

export default class GDPRNotification extends Component {
    state = { open: false };

    componentDidMount() {
        if (userHasAcceptedOrRejectedGATracking()) {
            return null;
        }

        return this.setState(state => Object.assign({}, state, {
            open: true,
        }));
    }

    acceptGDPRAlertAndDismissSnackbar = () => this.setState(
        state => Object.assign({}, state, { open: false }),
        acceptGATracking,
    );

    rejectGDPRAlertAndDismissSnackbar = () => this.setState(
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

        const snackbarMessage = (
            <div>
                The Open Apparel Registry uses cookies to collect and analyze
                site performance and usage. By clicking the Accept button, you
                agree to allow us to place cookies and share information with
                Google Analytics. For more information, please visit our{` `}
                <a
                    href="https://info.openapparel.org/tos/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Terms and Conditions of Use and Privacy Policy.
                </a>
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
                    message={snackbarMessage}
                />
            </ShowOnly>
        );
    }
}
