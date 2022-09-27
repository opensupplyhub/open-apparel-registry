import React, { useEffect, useState } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import get from 'lodash/get';
import merge from 'lodash/merge';
import find from 'lodash/find';
import capitalize from 'lodash/capitalize';
import isNil from 'lodash/isNil';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import MoveMatchDialog from './MoveMatchDialog';

import { makeFacilityDetailLink } from '../util/util';
import { facilityMatchStatusChoicesEnum } from '../util/constants';

import { facilityDetailsPropType } from '../util/propTypes';

const adjustMatchCardStyles = Object.freeze({
    cardStyles: Object.freeze({
        width: '45%',
        margin: '0 20px',
        padding: '10px',
    }),
    titleStyles: Object.freeze({
        padding: '10px 20px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
    matchContainerStyles: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        padding: '10px 0',
    }),
    matchHeaderStyles: Object.freeze({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
    }),
    detailItemContainerStyle: Object.freeze({
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    }),
    labelStyles: Object.freeze({
        fontSize: '16px',
        fontWeight: '700',
        padding: '5px 0 0',
    }),
    fieldStyles: Object.freeze({
        fontSize: '16px',
        padding: '0 0 5px',
    }),
    contentStyles: Object.freeze({
        paddingTop: '0 20px',
    }),
    nameRowStyles: Object.freeze({
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
    }),
    errorStyles: Object.freeze({
        padding: '10px 20px 0',
        color: 'red',
    }),
    buttonStyles: Object.freeze({
        margin: '0 5px',
    }),
});

const completeStatuses = [
    facilityMatchStatusChoicesEnum.AUTOMATIC,
    facilityMatchStatusChoicesEnum.CONFIRMED,
    facilityMatchStatusChoicesEnum.MERGED,
];
const isCompleteStatus = status => completeStatuses.includes(status);

const MatchDetailItem = ({ label, value = null, style = {} }) =>
    value && (
        <div
            style={merge(
                {},
                adjustMatchCardStyles.detailItemContainerStyles,
                style,
            )}
        >
            <Typography style={adjustMatchCardStyles.labelStyles}>
                {label}
            </Typography>
            <Typography style={adjustMatchCardStyles.fieldStyles}>
                {value}
            </Typography>
        </div>
    );

const dialogTypesEnum = Object.freeze({
    split: 'split',
    promote: 'promote',
});

export default function DashboardAdjustMatchCard({
    data,
    adjustData,
    adjusting,
    errorAdjusting,
    splitMatch,
    promoteMatch,
}) {
    const [matchToSplit, setMatchToSplit] = useState(null);
    const [matchToPromote, setMatchToPromote] = useState(null);
    const [loading, setLoading] = useState(false);
    const [matchToMove, setMatchToMove] = useState(null);

    const closeDialog = () => {
        setMatchToSplit(null);
        setMatchToPromote(null);
    };

    const openDialogForMatchToAdjust = (match, dialogType) => {
        if (dialogType === dialogTypesEnum.split) {
            return setMatchToSplit(match);
        }

        return setMatchToPromote(match);
    };

    const handleSplitMatch = () => {
        setLoading(true);
        splitMatch(matchToSplit.match_id);
    };

    const handlePromoteMatch = () => {
        setLoading(true);
        promoteMatch(matchToPromote.match_id);
    };

    const successfulSplitMessage = match =>
        match.facility_created_by_item
            ? 'Reverted match to original facility'
            : 'New facility was created';

    useEffect(() => {
        if (!adjusting && loading) {
            const toastMessage = matchToSplit
                ? successfulSplitMessage(matchToSplit)
                : 'Match was promoted';

            setMatchToSplit(null);
            setMatchToPromote(null);
            setLoading(false);

            if (!errorAdjusting) {
                toast(toastMessage);
            }
        }
    }, [
        adjusting,
        loading,
        matchToSplit,
        setMatchToSplit,
        matchToPromote,
        setMatchToPromote,
        setLoading,
        errorAdjusting,
    ]);

    const matches = get(data, 'properties.matches', []);

    const getNewOSIDFromAdjustData = ({ match_id: matchID }) =>
        get(find(adjustData, { match_id: matchID }), 'new_os_id', null);

    const createButtonControls = match => {
        if (getNewOSIDFromAdjustData(match)) {
            return (
                <Link
                    to={makeFacilityDetailLink(getNewOSIDFromAdjustData(match))}
                    href={makeFacilityDetailLink(
                        getNewOSIDFromAdjustData(match),
                    )}
                >
                    {getNewOSIDFromAdjustData(match)}
                </Link>
            );
        }

        const matchIsNotComplete = !isCompleteStatus(match.status);

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                {(match.facility_created_by_item || match.is_geocoded) && (
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={adjusting || matchIsNotComplete}
                        onClick={() =>
                            openDialogForMatchToAdjust(
                                match,
                                dialogTypesEnum.split,
                            )
                        }
                        style={adjustMatchCardStyles.buttonStyles}
                    >
                        {match.facility_created_by_item ? 'Revert' : 'Split'}
                    </Button>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    disabled={adjusting || matchIsNotComplete}
                    onClick={() => setMatchToMove(match)}
                    style={adjustMatchCardStyles.buttonStyles}
                >
                    Transfer to Alternate Facility
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={adjusting || matchIsNotComplete}
                    onClick={() =>
                        openDialogForMatchToAdjust(
                            match,
                            dialogTypesEnum.promote,
                        )
                    }
                    style={adjustMatchCardStyles.buttonStyles}
                >
                    Promote
                </Button>
            </div>
        );
    };

    const dialogContent = (() => {
        if (!matchToSplit && !matchToPromote) {
            return <div style={{ display: 'none' }} />;
        }

        const {
            title,
            subtitle,
            name,
            address,
            actionLabel,
            action,
        } = matchToSplit
            ? {
                  title: matchToSplit.facility_created_by_item
                      ? `Revert match to original facility ${matchToSplit.facility_created_by_item}`
                      : `Create a new facility from Match ${get(
                            matchToSplit,
                            'match_id',
                            '',
                        )}?`,
                  subtitle: matchToSplit.facility_created_by_item
                      ? 'This will connect the item to the original facility'
                      : 'This will create a new facility from:',
                  name: get(matchToSplit, 'name', ''),
                  address: get(matchToSplit, 'address', ''),
                  actionLabel: matchToSplit.facility_created_by_item
                      ? 'Revert match'
                      : 'Create facility',
                  action: handleSplitMatch,
              }
            : {
                  title: `Promote Match ${get(
                      matchToPromote,
                      'match_id',
                      '',
                  )}?`,
                  subtitle: 'This will set the canonical facility info to:',
                  name: get(matchToPromote, 'name', ''),
                  address: get(matchToPromote, 'address', ''),
                  actionLabel: 'Promote match',
                  action: handlePromoteMatch,
              };

        return (
            <>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Typography style={{ fontSize: '20px' }}>
                        {subtitle}
                    </Typography>
                    <Typography style={{ fontSize: '20px', padding: '10px 0' }}>
                        {name}
                    </Typography>
                    <Typography style={{ fontSize: '20px', padding: '10px 0' }}>
                        {address}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={closeDialog}
                        disabled={adjusting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={action}
                        disabled={adjusting}
                    >
                        {actionLabel}
                    </Button>
                </DialogActions>
            </>
        );
    })();

    return (
        <>
            <Card style={adjustMatchCardStyles.cardStyles}>
                <Typography
                    variant="title"
                    style={adjustMatchCardStyles.titleStyles}
                >
                    Matches to adjust
                    {adjusting && <CircularProgress />}
                </Typography>
                {errorAdjusting && (
                    <Typography style={adjustMatchCardStyles.errorStyles}>
                        {errorAdjusting[0]}
                    </Typography>
                )}
                <CardContent style={adjustMatchCardStyles.contentStyles}>
                    {matches.map(match => (
                        <div
                            key={`${match.list_id}${match.list_contributor_id}${match.address}`}
                            style={adjustMatchCardStyles.matchContainerStyles}
                        >
                            <div
                                style={adjustMatchCardStyles.matchHeaderStyles}
                            >
                                <Typography variant="title">
                                    Match {match.match_id}
                                </Typography>
                            </div>
                            <div>{createButtonControls(match)}</div>
                            <div style={adjustMatchCardStyles.nameRowStyles}>
                                <MatchDetailItem
                                    label="Contributor Name"
                                    value={match.list_contributor_name}
                                    style={{ width: '50%' }}
                                />
                                <MatchDetailItem
                                    label="List Name"
                                    value={match.list_name}
                                    style={{ width: '50%' }}
                                />
                            </div>
                            <MatchDetailItem
                                label="List Description"
                                value={match.list_description}
                            />
                            <MatchDetailItem label="Name" value={match.name} />
                            <MatchDetailItem
                                label="Address"
                                value={match.address}
                            />
                            <MatchDetailItem
                                label="Country Code"
                                value={match.country_code}
                            />
                            <MatchDetailItem
                                label="Status"
                                value={capitalize(match.status)}
                            />
                            <MatchDetailItem
                                label="Active"
                                value={match.is_active ? 'True' : 'False'}
                            />
                            <MatchDetailItem
                                label="Confidence Score"
                                value={match.confidence}
                            />
                            {!isNil(match.transferred_from) && (
                                <MatchDetailItem
                                    label="Transferred From"
                                    value={match.transferred_from}
                                />
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Dialog open={Boolean(matchToSplit) || Boolean(matchToPromote)}>
                {dialogContent}
            </Dialog>
            <MoveMatchDialog
                matchToMove={matchToMove}
                handleClose={() => setMatchToMove(null)}
            />
        </>
    );
}

DashboardAdjustMatchCard.defaultProps = {
    data: null,
    errorAdjusting: null,
};

DashboardAdjustMatchCard.propTypes = {
    data: facilityDetailsPropType,
    adjustData: arrayOf(
        shape({
            match_id: number.isRequired,
            new_os_id: string.isRequired,
        }),
    ).isRequired,
    adjusting: bool.isRequired,
    errorAdjusting: arrayOf(string),
    splitMatch: func.isRequired,
    promoteMatch: func.isRequired,
};
