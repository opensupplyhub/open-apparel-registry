import React, { useState } from 'react';
import { bool, func } from 'prop-types';
import { connect } from 'react-redux';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import clamp from 'lodash/clamp';
import last from 'lodash/last';

import BadgeClaimed from './BadgeClaimed';
import ClaimFacilityContactInfoStep from './ClaimFacilityContactInfoStep';
import ClaimFacilityFacilityInfoStep from './ClaimFacilityFacilityInfoStep';
import ClaimFacilityFinishUpStep from './ClaimFacilityFinishUpStep';

import { submitClaimAFacilityData } from '../actions/claimFacility';

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
});

const steps = Object.freeze([
    Object.freeze({
        name: 'Contact Information',
        component: ClaimFacilityContactInfoStep,
        next: 'Facility Information',
    }),
    Object.freeze({
        name: 'Facility Information',
        component: ClaimFacilityFacilityInfoStep,
        next: 'Finish Up',
    }),
    Object.freeze({
        name: 'Finish Up',
        component: ClaimFacilityFinishUpStep,
        next: 'Thank you',
    }),
]);

function ClaimFacilityStepper({ fetching, submitClaimForm }) {
    const [activeStep, setActiveStep] = useState(0);

    const incrementActiveStep = () =>
        setActiveStep(clamp(activeStep + 1, 0, steps.length));
    const decrementActiveStep = () =>
        setActiveStep(clamp(activeStep - 1, 0, steps.length));

    const {
        component: ActiveStepComponent,
        next: nextStepName,
        name: activeStepName,
    } = steps[activeStep];

    const { name: lastStepName } = last(steps);

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
                                                ? '#0427a4'
                                                : 'grey'
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
            <div style={claimFacilityStepperStyles.formContainerStyles}>
                <Typography variant="title">
                    {activeStep + 1 < steps.length
                        ? `Step ${activeStep + 2}: ${nextStepName}`
                        : nextStepName}
                </Typography>
                <div style={claimFacilityStepperStyles.buttonsContainerStyles}>
                    <Button
                        color="default"
                        variant="outlined"
                        onClick={decrementActiveStep}
                        style={claimFacilityStepperStyles.buttonStyles}
                        disabled={activeStep === 0}
                    >
                        Back
                    </Button>
                    {activeStep < steps.length - 1 && (
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={incrementActiveStep}
                            style={claimFacilityStepperStyles.buttonStyles}
                        >
                            Next
                        </Button>
                    )}
                    {activeStep === steps.length - 1 && (
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={submitClaimForm}
                            style={claimFacilityStepperStyles.buttonStyles}
                            disabled={fetching}
                        >
                            Finish
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

ClaimFacilityStepper.propTypes = {
    fetching: bool.isRequired,
    submitClaimForm: func.isRequired,
};

function mapStateToProps({
    claimFacility: {
        claimData: { fetching },
    },
}) {
    return {
        fetching,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        submitClaimForm: () => dispatch(submitClaimAFacilityData()),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ClaimFacilityStepper);
