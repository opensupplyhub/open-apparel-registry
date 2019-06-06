import React, { useState, useEffect } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { connect } from 'react-redux';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import clamp from 'lodash/clamp';
import last from 'lodash/last';

import BadgeClaimed from './BadgeClaimed';
import ClaimFacilityContactInfoStep from './ClaimFacilityContactInfoStep';
import ClaimFacilityFacilityInfoStep from './ClaimFacilityFacilityInfoStep';
import ClaimFacilityVerificationInfoStep from './ClaimFacilityVerificationInfoStep';
import ClaimFacilityConfirmationStep from './ClaimFacilityConfirmationStep';

import {
    submitClaimAFacilityData,
    updateClaimAFacilityEmail,
} from '../actions/claimFacility';

import COLOURS from '../util/COLOURS';

import {
    claimFacilityContactInfoStepIsValid,
    claimFacilityFacilityInfoStepIsValid,
    claimAFacilityFormIsValid,
} from '../util/util';

const claimFacilityStepperStyles = Object.freeze({
    containerStyles: Object.freeze({
        padding: '10px 20px 5px',
    }),
    buttonsContainerStyles: Object.freeze({
        padding: '24px 0',
    }),
    buttonStyles: Object.freeze({
        margin: '10px',
    }),
    formContainerStyles: Object.freeze({
        width: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
    }),
    validationMessageStyles: Object.freeze({
        padding: '5px 0',
    }),
});

const SUBMIT_FORM = 'SUBMIT_FORM';

const steps = Object.freeze([
    Object.freeze({
        name: 'Contact Information',
        component: ClaimFacilityContactInfoStep,
        next: 'Facility Information',
        hasBackButton: false,
        hasNextButton: true,
        stepInputIsValid: claimFacilityContactInfoStepIsValid,
    }),
    Object.freeze({
        name: 'Facility Information',
        component: ClaimFacilityFacilityInfoStep,
        next: 'Verification Information',
        hasBackButton: true,
        hasNextButton: true,
        stepInputIsValid: claimFacilityFacilityInfoStepIsValid,
    }),
    Object.freeze({
        name: 'Verification Information',
        component: ClaimFacilityVerificationInfoStep,
        next: 'Submit Facility Claim',
        hasBackButton: true,
        hasNextButton: true,
        nextButtonAction: SUBMIT_FORM,
        stepInputIsValid: claimAFacilityFormIsValid,
    }),
    Object.freeze({
        name: 'Submitted Successfully',
        component: ClaimFacilityConfirmationStep,
        next: null,
        hasBackButton: false,
        hasNextButton: false,
    }),
]);

function ClaimFacilityStepper({
    fetching,
    submitClaimForm,
    formData,
    contributorEmail,
    setEmailFromContributorEmail,
    error,
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [submittingForm, setSubmittingForm] = useState(false);

    useEffect(() => {
        setEmailFromContributorEmail(contributorEmail);
    }, [contributorEmail, setEmailFromContributorEmail]);

    const incrementActiveStep = () =>
        setActiveStep(clamp(activeStep + 1, 0, steps.length));
    const decrementActiveStep = () =>
        setActiveStep(clamp(activeStep - 1, 0, steps.length));

    const {
        component: ActiveStepComponent,
        next: nextStepName,
        name: activeStepName,
        hasBackButton,
        hasNextButton,
        nextButtonAction,
        stepInputIsValid,
    } = steps[activeStep];

    useEffect(() => {
        if (fetching) {
            setSubmittingForm(true);
        } else if (nextButtonAction === SUBMIT_FORM && !fetching && !error && submittingForm) {
            setSubmittingForm(false);
            setActiveStep(activeStep + 1);
        }
    }, [
        submittingForm,
        setSubmittingForm,
        nextButtonAction,
        activeStep,
        setActiveStep,
        error,
        fetching,
    ]);

    const { name: lastStepName } = last(steps);

    const controlsSection =
        activeStepName !== lastStepName ? (
            <>
                <div style={claimFacilityStepperStyles.formContainerStyles}>
                    <Typography variant="title">
                        {nextButtonAction !== SUBMIT_FORM
                            ? `Step ${activeStep + 2}: ${nextStepName}`
                            : nextStepName}
                    </Typography>
                    {
                        (error || !stepInputIsValid(formData))
                            ? (
                                <Typography
                                    variant="body2"
                                    style={
                                        claimFacilityStepperStyles.validationMessageStyles
                                    }
                                    color="error"
                                >
                                    {
                                        error
                                            ? 'An error prevented submitting the form'
                                            : 'Some required fields are missing or invalid.'
                                    }
                                </Typography>
                            )
                            : null
                    }
                    <div style={claimFacilityStepperStyles.buttonsContainerStyles}>
                        {hasBackButton && (
                            <Button
                                color="default"
                                variant="outlined"
                                onClick={decrementActiveStep}
                                style={claimFacilityStepperStyles.buttonStyles}
                                disabled={activeStep === 0}
                            >
                                Back
                            </Button>
                        )}
                        {hasNextButton && nextButtonAction !== SUBMIT_FORM && (
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={incrementActiveStep}
                                style={claimFacilityStepperStyles.buttonStyles}
                                disabled={!stepInputIsValid(formData)}
                            >
                                Next
                            </Button>
                        )}
                        {hasNextButton && nextButtonAction === SUBMIT_FORM && (
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={submitClaimForm}
                                style={claimFacilityStepperStyles.buttonStyles}
                                disabled={
                                    fetching ||
                                    !claimAFacilityFormIsValid(formData)
                                }
                            >
                                {fetching ? <CircularProgress size={5} /> : 'Submit'}
                            </Button>
                        )}
                    </div>
                </div>
            </>
        ) : null;

    return (
        <div style={claimFacilityStepperStyles.containerStyles}>
            <Stepper activeStep={activeStep}>
                {steps.map(({ name }, index) => (
                    <Step key={name}>
                        {name === lastStepName ? (
                            <StepLabel
                                icon={
                                    <BadgeClaimed
                                        color={
                                            activeStepName === lastStepName
                                                ? COLOURS.NAVY_BLUE
                                                : COLOURS.GREY
                                        }
                                    />
                                }
                            >
                                {activeStep === index ? name : ''}
                            </StepLabel>
                        ) : (
                            <StepLabel>
                                {activeStep === index ? name : ''}
                            </StepLabel>
                        )}
                    </Step>
                ))}
            </Stepper>
            <div style={claimFacilityStepperStyles.formContainerStyles}>
                <ActiveStepComponent />
            </div>
            {controlsSection}
        </div>
    );
}

ClaimFacilityStepper.defaultProps = {
    error: null,
};

ClaimFacilityStepper.propTypes = {
    fetching: bool.isRequired,
    submitClaimForm: func.isRequired,
    formData: shape({
        email: string.isRequired,
        companyName: string.isRequired,
        contactPerson: string.isRequired,
        phoneNumber: string.isRequired,
        preferredContactMethod: shape({
            value: string.isRequired,
            label: string.isRequired,
        }),
    }).isRequired,
    contributorEmail: string.isRequired,
    setEmailFromContributorEmail: func.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    claimFacility: {
        claimData: { fetching, formData, error },
    },
    auth: {
        user: {
            user: { email: contributorEmail },
        },
    },
}) {
    return {
        fetching,
        formData,
        contributorEmail,
        error,
    };
}

function mapDispatchToProps(
    dispatch,
    {
        match: {
            params: { oarID },
        },
    },
) {
    return {
        submitClaimForm: () => dispatch(submitClaimAFacilityData(oarID)),
        setEmailFromContributorEmail: email =>
            dispatch(updateClaimAFacilityEmail(email)),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityStepper);
