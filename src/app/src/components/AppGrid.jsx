import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';

export default function AppGrid({
    style,
    title,
    children,
}) {
    return (
        <Grid container>
            <Grid
                item
                xs={12}
                sm={9}
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                }}
            >
                <Grid container style={style}>
                    <Grid item xs={12}>
                        <h2
                            style={{
                                fontFamily: 'Roboto',
                                fontWeight: 'normal',
                                fontSize: '32px',
                            }}
                        >
                            {title}
                        </h2>
                    </Grid>
                    {children}
                </Grid>
            </Grid>
        </Grid>
    );
}

AppGrid.defaultProps = {
    style: {},
};

AppGrid.propTypes = {
    title: PropTypes.string.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    children: PropTypes.node.isRequired,
};
