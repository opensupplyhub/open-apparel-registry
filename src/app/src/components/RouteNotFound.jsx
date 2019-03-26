import React, { memo } from 'react';
import Grid from '@material-ui/core/Grid';

import AppGrid from './AppGrid';

const RouteNotFound = memo(() => (
    <AppGrid title="Not found">
        <Grid container className="margin-bottom-64">
            <Grid item xs={12}>
                <p>
                    Not found
                </p>
            </Grid>
        </Grid>
    </AppGrid>
));

export default RouteNotFound;
