import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import layers from '../data/layers.json';

export default class MapLayers extends PureComponent {
    handleClose = () => this.props.close(false);

    render() {
        const { open, onClickStyle, mapStyle } = this.props;

        return (
            <div>
                <Dialog
                    fullWidth
                    open={open}
                    onClose={this.handleClose}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                    classes={{ paper: 'max-height-70' }}
                >
                    <DialogTitle id='alert-dialog-title'>
                        Choose a map style
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={24}>
                            {layers.map(l => (
                                <Grid key={`${l.value}_grid`} item xs={4}>
                                    <Card
                                        key={`${l.value}_card`}
                                        onClick={() => onClickStyle(l.value)}
                                        className={
                                            l.value === mapStyle
                                                ? 'highlight cursor'
                                                : 'cursor'
                                        }
                                    >
                                        <img
                                            key={`${l.value}_img`}
                                            style={{ height: '112px' }}
                                            alt={l.display}
                                            src={require(`./../styles/images/${
                                                l.value
                                            }.png`)}
                                        />
                                        <p
                                            key={`${l.value}_p`}
                                            className='text-center'
                                        >
                                            {l.display}
                                        </p>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color='primary'>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

MapLayers.propTypes = {
    open: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    onClickStyle: PropTypes.func.isRequired,
    mapStyle: PropTypes.string.isRequired,
};
