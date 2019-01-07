import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';

const itemMap = (item) => {
    switch (item.type) {
        case 'link':
            return (
                <Link to={item.url} href={item.url} className="link full-width-height">
                    {item.text}
                </Link>
            );
        case 'external':
            return (
                <a
                    className="link full-width-height"
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {item.text}
                </a>
            );
        default:
            return (
                <Button color="primary" onClick={item.action}>
                    {item.text}
                </Button>
            );
    }
};

class NavbarDropdown extends Component {
    state = {
        open: false,
    };

    handleToggle = () => this.setState(state => ({ open: !state.open }));

    handleClose = (event) => {
        if (this.anchorEl.contains(event.target)) {
            return;
        }

        this.setState({ open: false });
    };

    render() {
        const { title, links } = this.props;
        const { open } = this.state;

        const DropdownItems = ({ items, onClick }) =>
            items.map(item => (
                <MenuItem key={`li-${item.text}`} onClick={onClick}>
                    {itemMap(item)}
                </MenuItem>
            ));

        return (
            <div>
                <Button
                    className="btn-text"
                    disableRipple
                    buttonRef={(node) => {
                        this.anchorEl = node;
                    }}
                    aria-owns={open ? 'menu-list-grow' : null}
                    aria-haspopup="true"
                    onClick={this.handleToggle}
                >
                    {title}
                </Button>
                <Popper
                    className="dropdown"
                    open={open}
                    anchorEl={this.anchorEl}
                    transition
                    disablePortal
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="menu-list-grow"
                            style={{
                                transformOrigin:
                                    placement === 'bottom'
                                        ? 'center top'
                                        : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener
                                    onClickAway={this.handleClose}
                                >
                                    <MenuList>
                                        <DropdownItems
                                            items={links}
                                            onClick={this.handleClose}
                                        />
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </div>
        );
    }
}

NavbarDropdown.propTypes = {
    title: PropTypes.string.isRequired,
    links: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default NavbarDropdown;
