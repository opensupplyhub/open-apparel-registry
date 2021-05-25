import React from 'react';
import { arrayOf, bool, number, string } from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { withStyles } from '@material-ui/core/styles';

import { pluralizeFacilitiesCount } from '../util/util.js';

const styles = theme => ({
    root: {
        margin: 0,
        verticalAlign: 'center',
        marginRight: '5px',
        flex: 1,
    },
    text: {
        backgroundColor: theme.palette.primary.coloredBackground,
        paddingLeft: '5px',
        paddingRight: '5px',
        alignText: 'center',
        color: theme.palette.primary.main,
        minWidth: '100px',
        overflow: 'none',
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily,
    },
});

const FacilitySidebarSearchTabFacilitiesCount = ({
    facilitiesCount,
    fetching,
    error,
    classes,
}) => {
    if (!facilitiesCount || fetching || error) {
        return null;
    }

    return (
        <div className={classes.root}>
            <p className={classes.text}>
                {pluralizeFacilitiesCount(facilitiesCount)}
            </p>
        </div>
    );
};

FacilitySidebarSearchTabFacilitiesCount.defaultProps = {
    facilitiesCount: null,
    error: null,
};

FacilitySidebarSearchTabFacilitiesCount.propTypes = {
    facilitiesCount: number,
    fetching: bool.isRequired,
    error: arrayOf(string),
};

function mapStateToProps({
    facilities: {
        facilities: { data, error, fetching },
    },
}) {
    return {
        error,
        fetching,
        facilitiesCount: get(data, 'count', null),
    };
}

export default connect(mapStateToProps)(
    withStyles(styles)(FacilitySidebarSearchTabFacilitiesCount),
);
