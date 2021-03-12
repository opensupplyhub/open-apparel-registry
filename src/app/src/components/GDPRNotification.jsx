import React, { Component } from 'react';
import { connect } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import Button from './Button';
import ShowOnly from './ShowOnly';
import COLOURS from '../util/COLOURS';
import CookiePreferencesText from './CookiePreferencesText';

import { setGDPROpen } from '../actions/ui';

import {
    userHasAcceptedOrRejectedGATracking,
    userHasAcceptedGATracking,
    acceptGATrackingAndStartTracking,
    rejectGATracking,
    startGATrackingIfUserHasAcceptedNotification,
    clearGATrackingDecision,
} from '../util/util.ga';

class GDPRNotification extends Component {
    componentDidMount() {
        if (userHasAcceptedOrRejectedGATracking()) {
            if (userHasAcceptedGATracking()) {
                startGATrackingIfUserHasAcceptedNotification();
            }

            return null;
        }

        return this.props.openGDPR();
    }

    acceptGDPRAlertAndDismissSnackbar = () => {
        clearGATrackingDecision();
        acceptGATrackingAndStartTracking();
        this.props.closeGDPR();
    };

    rejectGDPRAlertAndDismissSnackbar = () => {
        clearGATrackingDecision();
        rejectGATracking();
        this.props.closeGDPR();
    };

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
            <ShowOnly when={this.props.open}>
                <Snackbar
                    className="gdpr-notification"
                    open={this.props.open}
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

function mapStateToProps({ ui: { gdprOpen } }) {
    return { open: gdprOpen };
}

function mapDispatchToProps(dispatch) {
    return {
        openGDPR: () => dispatch(setGDPROpen(true)),
        closeGDPR: () => dispatch(setGDPROpen(false)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GDPRNotification);
