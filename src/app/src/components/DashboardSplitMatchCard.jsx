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
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { makeFacilityDetailLink } from '../util/util';

import { facilityDetailsPropType } from '../util/propTypes';

const splitMatchCardStyles = Object.freeze({
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
});

const MatchDetailItem = ({ label, value = null, style = {} }) =>
    value && (
        <div
            style={merge(
                {},
                splitMatchCardStyles.detailItemContainerStyles,
                style,
            )}
        >
            <Typography style={splitMatchCardStyles.labelStyles}>
                {label}
            </Typography>
            <Typography style={splitMatchCardStyles.fieldStyles}>
                {value}
            </Typography>
        </div>
    );

export default function DashboardSplitMatchCard({
    data,
    splitData,
    splitting,
    errorSplitting,
    splitMatch,
}) {
    const [matchToSplit, setMatchToSplit] = useState(null);
    const [loading, setLoading] = useState(false);

    const closeDialog = () => setMatchToSplit(null);

    const openDialogForMatchToSplit = match => setMatchToSplit(match);

    const handleSplitMatch = () => {
        setLoading(true);
        splitMatch(matchToSplit.match_id);
    };

    useEffect(() => {
        if (!splitting && loading) {
            setMatchToSplit(null);
            setLoading(false);

            if (!errorSplitting) {
                toast('New facility was created');
            }
        }
    }, [splitting, loading, setMatchToSplit, setLoading, errorSplitting]);

    const matches = get(data, 'properties.matches', []);

    const getNewOARIDFromSplitData = ({ match_id: matchID }) =>
        get(find(splitData, { match_id: matchID }), 'new_oar_id', null);

    return (
        <>
            <Card style={splitMatchCardStyles.cardStyles}>
                <Typography
                    variant="title"
                    style={splitMatchCardStyles.titleStyles}
                >
                    Matches to split
                    {splitting && <CircularProgress />}
                </Typography>
                {errorSplitting && (
                    <Typography style={splitMatchCardStyles.errorStyles}>
                        An error prevented splitting that facility match
                    </Typography>
                )}
                <CardContent style={splitMatchCardStyles.contentStyles}>
                    {matches.map(match => (
                        <div
                            key={`${match.list_id}${match.list_item_id}`}
                            style={splitMatchCardStyles.matchContainerStyles}
                        >
                            <div style={splitMatchCardStyles.matchHeaderStyles}>
                                <Typography variant="title">
                                    Match {match.match_id}
                                </Typography>
                                {!getNewOARIDFromSplitData(match) ? (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={splitting}
                                        onClick={() =>
                                            openDialogForMatchToSplit(match)
                                        }
                                    >
                                        Split
                                    </Button>
                                ) : (
                                    <Link
                                        to={makeFacilityDetailLink(
                                            getNewOARIDFromSplitData(match),
                                        )}
                                        href={makeFacilityDetailLink(
                                            getNewOARIDFromSplitData(match),
                                        )}
                                    >
                                        {getNewOARIDFromSplitData(match)}
                                    </Link>
                                )}
                            </div>
                            <div style={splitMatchCardStyles.nameRowStyles}>
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
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Dialog open={Boolean(matchToSplit)}>
                {matchToSplit ? (
                    <>
                        <DialogTitle>
                            Create a new facility from Match{' '}
                            {get(matchToSplit, 'match_id', '')}?
                        </DialogTitle>
                        <DialogContent>
                            <Typography style={{ fontSize: '20px' }}>
                                This will create a new facility from:
                            </Typography>
                            <Typography
                                style={{ fontSize: '20px', padding: '10px 0' }}
                            >
                                {get(matchToSplit, 'name', '')}
                            </Typography>
                            <Typography
                                style={{ fontSize: '20px', padding: '10px 0' }}
                            >
                                {get(matchToSplit, 'address', '')}
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={closeDialog}
                                disabled={splitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleSplitMatch}
                                disabled={splitting}
                            >
                                Create facility
                            </Button>
                        </DialogActions>
                    </>
                ) : (
                    <div style={{ display: 'none' }} />
                )}
            </Dialog>
        </>
    );
}

DashboardSplitMatchCard.defaultProps = {
    data: null,
    errorSplitting: null,
};

DashboardSplitMatchCard.propTypes = {
    data: facilityDetailsPropType,
    splitData: arrayOf(
        shape({
            match_id: number.isRequired,
            new_oar_id: string.isRequired,
        }),
    ).isRequired,
    splitting: bool.isRequired,
    errorSplitting: arrayOf(string),
    splitMatch: func.isRequired,
};
