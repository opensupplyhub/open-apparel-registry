import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import constant from 'lodash/constant';
import attempt from 'lodash/attempt';
import isError from 'lodash/isError';
import moment from 'moment';

const surveyURL = 'http://bit.ly/OARSurvey';

const surveyDialogStyles = Object.freeze({
    containerStyles: Object.freeze({
        padding: '10px',
    }),
    titleStyles: Object.freeze({
        marginLeft: '10px',
    }),
    contentStyles: Object.freeze({
        fontSize: '20px',
        margin: '5px 10px 10px 10px',
    }),
});

const InvisibleDiv = constant(<div style={{ display: 'none ' }} />);

const surveyEndDate = moment('2019-11-10');
const currentDate = moment();
const SURVEY_DIALOG_HAS_BEEN_DISPLAYED = 'SURVEY_DIALOG_HAS_BEEN_DISPLAYED';

const trySetDialogHasBeenDisplayedToLocalStorage = () => attempt(
    () => window.localStorage.setItem(
        SURVEY_DIALOG_HAS_BEEN_DISPLAYED,
        SURVEY_DIALOG_HAS_BEEN_DISPLAYED,
    ),
);

const dialogEntryIsNotSavedInLocalStorage = () => {
    const result = attempt(
        () => window.localStorage.getItem(SURVEY_DIALOG_HAS_BEEN_DISPLAYED),
    );

    return isError(result) ? true : !result;
};

export default function SurveyDialogNotification() {
    const [dialogIsOpen, setDialogIsOpen] = useState(
        currentDate.isBefore(surveyEndDate) &&
            dialogEntryIsNotSavedInLocalStorage(),
    );

    const closeDialog = () => {
        trySetDialogHasBeenDisplayedToLocalStorage();

        return setDialogIsOpen(false);
    };

    return (
        <Dialog open={dialogIsOpen}>
            {dialogIsOpen ? (
                <div style={surveyDialogStyles.containerStyles}>
                    <DialogTitle style={surveyDialogStyles.titleStyles}>
                        Help us help you
                    </DialogTitle>
                    <DialogContent>
                        <Typography style={surveyDialogStyles.contentStyles}>
                            We prioritize developments & new features on the OAR
                            based on user feedback.
                        </Typography>
                        <Typography style={surveyDialogStyles.contentStyles}>
                            Got something you&#39;d like to see on the tool? Share
                            your feedback through our survey:{' '}
                            <a
                                href={surveyURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={closeDialog}
                            >
                                {surveyURL}
                            </a>
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={closeDialog}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </div>
            ) : (
                <InvisibleDiv />
            )}
        </Dialog>
    );
}
