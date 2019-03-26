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

        const GDPRMessage =
            `We use cookies to collect and analyze
            information on site performance and usage,
            and to enhance content. By clicking Accept,
            you agree to allow cookies to be placed.
            To find out more, visit our terms of service
            and our privacy policy.`;

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
                    message={GDPRMessage}
                />
            </ShowOnly>
        );
    }
}
