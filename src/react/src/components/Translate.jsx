import React, { PureComponent } from 'react';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import langs from '../data/lang.json';

export default class Translate extends PureComponent {
    state = {
        open: false,
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleListItemClick = (value) => {
        window.location = `#googtrans(en|${value})`;
        window.location.reload(true);
        this.handleClose();
    };

    render() {
        const { open } = this.state;

        return (
            <div>
                <Button
                    className="btn-text"
                    disableRipple
                    onClick={this.handleClickOpen}
                >
                    LANGUAGE
                </Button>

                <Dialog
                    open={open}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    classes={{ paper: 'max-height-70' }}
                >
                    <DialogTitle id="alert-dialog-title">
                        Choose a language
                    </DialogTitle>
                    <div>
                        <List>
                            {langs.map(lang => (
                                <ListItem
                                    button
                                    key={lang.value}
                                    onClick={() =>
                                        this.handleListItemClick(lang.value)
                                    }
                                >
                                    <ListItemText
                                        primary={lang.lang}
                                        className="notranslate"
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </div>
                </Dialog>
            </div>
        );
    }
}
