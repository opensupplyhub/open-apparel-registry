import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import InfoIcon from '@material-ui/icons/Info';

function arrowGenerator(color) {
    return {
        '&[x-placement*="right"] $arrow': {
            left: 0,
            marginLeft: '-0.95em',
            height: '3em',
            width: '1em',
            '&::before': {
                borderWidth: '1em 1em 1em 0',
                borderColor: `transparent ${color} transparent transparent`,
            },
        },
    };
}

const styles = theme => ({
    arrow: {
        position: 'absolute',
        fontSize: 6,
        width: '3em',
        height: '3em',
        '&::before': {
            content: '""',
            margin: 'auto',
            display: 'block',
            width: 0,
            height: 0,
            borderStyle: 'solid',
        },
    },
    htmlPopper: arrowGenerator('#dadde9'),
    htmlTooltip: {
        backgroundColor: '#ffffff',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
        '& b': {
            fontWeight: theme.typography.fontWeightMedium,
        },
    },
    popover: {
        fontSize: '15px',
        padding: '10px',
        lineHeight: '22px',
        maxWidth: '320px',
        margin: '0 14px',
    },
    popoverLineItem: {
        marginBottom: '6px',
    },
    popoverHeading: {
        fontWeight: 'bold',
    },
    icon: {
        color: 'rgba(0, 0, 0, 0.38)',
        paddingLeft: '0.5rem',
    },
});

class CustomizedTooltips extends React.Component {
    state = {
        arrowRef: null,
    };

    handleArrowRef = node => {
        this.setState({
            arrowRef: node,
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <Tooltip
                enterTouchDelay={0}
                leaveTouchDelay={5000}
                placement="right"
                classes={{
                    popper: classes.htmlPopper,
                    tooltip: classes.htmlTooltip,
                }}
                PopperProps={{
                    popperOptions: {
                        modifiers: {
                            arrow: {
                                enabled: Boolean(this.state.arrowRef),
                                element: this.state.arrowRef,
                            },
                        },
                    },
                }}
                title={
                    <React.Fragment>
                        <div style={styles.popover}>
                            <p style={styles.popoverHeading}>
                                Do you want to see only facilities which these
                                contributors share? If so, tick this box.
                            </p>
                            <p>
                                There are now two ways to filter a Contributor
                                search on OS Hub:
                            </p>
                            <ol>
                                <li style={styles.popoverLineItem}>
                                    You can search for all the facilities of
                                    multiple contributors. This means that the
                                    results would show all of the facilities
                                    contributed to OS Hub by, for example, BRAC
                                    University or Clarks. Some facilities might
                                    have been contributed by BRAC University but
                                    not by Clarks, or vice-versa.
                                </li>
                                <li style={styles.popoverLineItem}>
                                    By checking the “Show only shared
                                    facilities” box, this adjusts the search
                                    logic to “AND”. This means that your results
                                    will show only facilities contributed by
                                    BOTH BRAC University AND Clarks (as well as
                                    potentially other contributors). In this
                                    way, you can more quickly filter to show the
                                    specific Contributor overlap you are
                                    interested in.
                                </li>
                            </ol>
                        </div>
                    </React.Fragment>
                }
            >
                <InfoIcon className={classes.icon} fontSize="inherit" />
            </Tooltip>
        );
    }
}

CustomizedTooltips.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CustomizedTooltips);
