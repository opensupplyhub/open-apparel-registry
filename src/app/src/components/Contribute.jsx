import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import AppGrid from './AppGrid';

import ContributeHeader from './ContributeHeader';
import ContributeForm from './ContributeForm';
import ContributeTroubleshooting from './ContributeTroubleshooting';

import { listsRoute } from '../util/constants';

export default function ContributeList() {
    return (
        <AppGrid title="Contribute">
            <Grid container className="margin-bottom-64">
                <Grid item xs={12}>
                    <ContributeHeader />
                    <ContributeForm />
                    <div className="form__field">
                        <p className="form__label">
                            Once the list has been successfully
                            uploaded, view your list and confirm or deny
                            matches.
                        </p>
                    </div>
                    <div className="form__field">
                        <Link
                            to={listsRoute}
                            href={listsRoute}
                            className="outlined-button outlined-button--link margin-top-16"
                        >
                            View My Lists
                        </Link>
                    </div>
                </Grid>
                <ContributeTroubleshooting />
            </Grid>
        </AppGrid>
    );
}
