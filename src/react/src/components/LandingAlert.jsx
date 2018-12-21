import React, { PureComponent } from 'react';
import Grid from '@material-ui/core/Grid';
import ShowOnly from './ShowOnly';

class LandingAlert extends PureComponent {
    state = { open: true };

    componentDidMount() {
        const dismissed = sessionStorage.getItem('dismissedLandingAlert');
        if (dismissed) this.setState({ open: false });
    }

    dismissAlert = () => {
        this.setState({ open: false });
        sessionStorage.setItem('dismissedLandingAlert', true);
    };

    render() {
        return (
            <ShowOnly if={this.state.open}>
                <Grid container>
                    <Grid item xs={12} sm={3} />
                    <Grid item xs={12} sm={9}>
                        <div className='alert-wrapper'>
                            <div className='alert'>
                                <p className='heading'>
                                    Welcome to the Open Apparel Registry (beta)!
                                </p>
                                <p>
                                    This tool is undergoing beta testing,
                                    however you can already explore over 50,000
                                    facilities around the world. Start your
                                    search with the filters on the left. We
                                    welcome your feedback as we continue to
                                    improve and refine the tool, please email
                                    comments to{' '}
                                    <a
                                        href='mailto:info@openapparel.org'
                                        style={{ color: 'white' }}
                                    >
                                        info@openapparel.org
                                    </a>
                                    .
                                </p>
                                <button
                                    type='button'
                                    className='alert-close'
                                    onClick={this.dismissAlert}
                                    aria-label='Close'
                                >
                                    &times;
                                </button>
                            </div>
                        </div>
                    </Grid>
                </Grid>
            </ShowOnly>
        );
    }
}

export default LandingAlert;
