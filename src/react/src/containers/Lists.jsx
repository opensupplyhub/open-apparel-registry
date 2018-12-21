/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CircularProgress from '@material-ui/core/CircularProgress';
import PropTypes from 'prop-types';
import { parse } from 'json2csv';
import ShowOnly from '../components/ShowOnly';
import TablePaginationWrapper from '../components/TablePaginationWrapper';
import * as userActions from '../actions/user';
import * as listsActions from '../actions/lists';
import AppGrid from './AppGrid';
import { DownloadCSV } from '../util/util';

const styles = {
    root: {
        width: '100%',
        overflowX: 'auto',
    },
    table: {
        minWidth: 700,
    },
    header: {
        color: 'gray',
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
};

const mapStateToProps = state => ({
    user: state.user,
    lists: state.lists,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ ...userActions, ...listsActions }, dispatch),
});

class Lists extends Component {
    static contextTypes = {
        router: PropTypes.object,
    };

    state = {
        page: 0,
        rowsPerPage: 100,
        showPendingMsg: 0,
        isSpinning: true,
    };

    componentWillMount() {
        this.getLists(this.props.user.uid);
    }

    getLists = uid =>
        this.props.actions.setLists(uid, () => {
            this.setState({ isSpinning: false });
        });

    updateList = selectedList =>
        this.props.actions.updateList(
            this.props.user.uid,
            selectedList,
            this.checkIfProcessed,
        );

    selectList = selectedList => this.props.actions.selectList(selectedList);

    toggleRow = rowId => () => this.props.actions.toggleRow(rowId);

    confirmDenyMatch = (confirm, tempId, matchedId) => () =>
        this.props.actions.confirmDenyMatch(confirm, tempId, matchedId);

    chooseList = ({ target: { value } }) => {
        if (!value || value === '') return;

        const {
            lists: { lists },
        } = this.props;
        if (!lists[value]) return;

        this.resetShowPending();

        this.selectList(value);

        this.checkIfProcessed(value, true);
    };

    // Check the selected list is processed, if yes, do nothing, if no, try updateList after 5s
    checkIfProcessed = (selectedList, first) => {
        const {
            lists: { lists },
        } = this.props;
        if (!lists[selectedList]) return;
        const unProcessed = lists[selectedList].some(l => !l.processed);
        if (unProcessed) {
            const unProcessedNum = lists[selectedList].filter(u => !u.processed)
                .length;
            if (unProcessedNum && unProcessedNum > 0) {
                const previousNum = this.state.showPendingMsg;
                this.setState({ showPendingMsg: unProcessedNum });
                // Only ask ursa for new list again in 10s if the new unProcessedNum decreased (unProcessedNum < previousNum) eslint-disable-line max-len
                // Or user just select a new list (first === true)
                if (unProcessedNum < previousNum || first) {
                    setTimeout(() => this.updateList(selectedList), 10000);
                }
            }
        } else {
            this.resetShowPending();
        }
    };

    resetShowPending = () => this.setState({ showPendingMsg: 0 });

    handleChangePage = (event, page) => {
        this.setState({ page });
        window.scrollTo(0, 0);
    };

    handleChangeRowsPerPage = event =>
        this.setState({ rowsPerPage: event.target.value });

    factoriesCSV = (data) => {
        const cleanedData = [];
        data.forEach((temp) => {
            const { country, name, address } = temp.data;
            if (
                temp.matched &&
                temp.matched.length &&
                temp.matched.length > 0
            ) {
                temp.matched.forEach((m) => {
                    const matchedName = m.name;
                    const matchedAddress = m.address;
                    const factoryObj = {
                        _id: temp._id,
                        country,
                        name,
                        address,
                        matchedName,
                        matchedAddress,
                        confirm: m.confirm,
                        matchedId: m.nameId._id,
                    };
                    cleanedData.push(factoryObj);
                });
            } else {
                const factoryObj = {
                    _id: temp._id,
                    country,
                    name,
                    address,
                    matchedName: 'No Match',
                    matchedAddress: 'No Match',
                    confirm: 'No Match',
                    matchedId: 'No Match',
                };
                cleanedData.push(factoryObj);
            }
        });
        return parse(cleanedData, {
            fields: [
                '_id',
                'country',
                'name',
                'address',
                'matchedName',
                'matchedAddress',
                'confirm',
                'matchedId',
            ],
        });
    };

    render() {
        const {
            user,
            lists: { lists, selectedList },
        } = this.props;
        const data =
            lists && selectedList && lists[selectedList]
                ? lists[selectedList]
                : [];
        const {
            rowsPerPage, page, showPendingMsg, isSpinning,
        } = this.state;
        const processdate =
            showPendingMsg && showPendingMsg > 0
                ? new Date(showPendingMsg * 1000)
                : null;
        const processdateStr = processdate
            ? `${processdate.getUTCHours()} hours, ${processdate.getUTCMinutes()} minutes and ${processdate.getUTCSeconds()} second(s)`
            : '';
        return (
            <ShowOnly if={user.loaded}>
                <AppGrid title="My Lists">
                    <Grid container className="margin-bottom-16">
                        <Grid item xs={12}>
                            <ShowOnly if={isSpinning}>
                                <CircularProgress size={50} />
                            </ShowOnly>
                            <ShowOnly if={!isSpinning}>
                                <ShowOnly if={Object.keys(lists).length === 0}>
                                    <p>
                                        You currently have no lists to view.
                                        Please contribute a list of factories to
                                        the OAR first.
                                    </p>
                                    <div className="margin-top-16">
                                        <Link
                                            to="/contribute"
                                            href="/contribute"
                                            className="outlined-button outlined-button--link"
                                        >
                                            Contribute
                                        </Link>
                                    </div>
                                </ShowOnly>
                                <ShowOnly if={Object.keys(lists).length > 0}>
                                    <p>
                                        Review your uploaded list below,
                                        including exact matches and partial
                                        matches. Partial matches refer to other
                                        entires found within the Registry that
                                        might correspond to the same facility on
                                        your list. Confirm or Deny these partial
                                        matches to help improve the OAR.
                                    </p>
                                    <Select
                                        value={selectedList}
                                        onChange={this.chooseList}
                                        name="lists"
                                        displayEmpty
                                        className="margin-top-16 margin-bottom-10 notranslate"
                                        autoWidth
                                        input={
                                            <Input
                                                name="lists"
                                                id="lists"
                                                className="notranslate"
                                            />
                                        }
                                        MenuProps={{
                                            style: {
                                                maxHeight: '50vh',
                                            },
                                        }}
                                    >
                                        <MenuItem value="">
                                            Choose a List
                                        </MenuItem>
                                        {Object.keys(lists)
                                            .sort((a, b) => b - a)
                                            .map((c) => {
                                                const splitC = c.split('_');
                                                const timeStamp = splitC.pop();
                                                const formatTime = new Date(Number(timeStamp)).toLocaleDateString();
                                                return (
                                                    <MenuItem
                                                        className="notranslate"
                                                        value={c}
                                                        key={c}
                                                    >{`${splitC}_${formatTime}`}
                                                    </MenuItem>
                                                );
                                            })}
                                    </Select>
                                </ShowOnly>
                            </ShowOnly>
                        </Grid>
                    </Grid>
                    <Grid container className="margin-bottom-64">
                        <ShowOnly if={data.length > 0}>
                            <ShowOnly
                                if={
                                    processdate &&
                                    processdateStr &&
                                    processdateStr !== ''
                                }
                            >
                                <div>
                                    <p>
                                        {`We are in the process of parsing this list. It will take approximately ${processdateStr}. Please come back later. `}
                                    </p>
                                    <Link className="link-underline" to="/" href="/">
                                        Back to map
                                    </Link>
                                </div>
                            </ShowOnly>

                            <Grid item style={{ textAlign: 'right' }}>
                                <Button
                                    onClick={() =>
                                        DownloadCSV(
                                            this.factoriesCSV(data),
                                            'factories.csv',
                                        )
                                    }
                                    variant="contained"
                                    size="small"
                                    color="primary"
                                    className="margin-bottom-16 blue-background"
                                    disableRipple
                                    style={{
                                        boxShadow: 'none',
                                    }}
                                >
                                    Download
                                </Button>
                                <Paper style={styles.root}>
                                    <Table style={styles.table}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell padding="dense" />
                                                <TableCell padding="none">
                                                    Country
                                                </TableCell>
                                                <TableCell padding="dense">
                                                    Status
                                                </TableCell>
                                                <TableCell padding="none">
                                                    Name
                                                </TableCell>
                                                <TableCell padding="none">
                                                    OAR ID
                                                </TableCell>
                                                <TableCell padding="dense">
                                                    Address
                                                </TableCell>
                                                <TableCell padding="dense">
                                                    Matched Results
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data
                                                .slice(
                                                    page * rowsPerPage,
                                                    page * rowsPerPage +
                                                        rowsPerPage,
                                                )
                                                .map((n, nIndex) => {
                                                    if (
                                                        !n.matched ||
                                                        n.matched.length <= 0
                                                    ) {
                                                        return (
                                                            <TableRow
                                                                key={n._id}
                                                                style={{
                                                                    background:
                                                                        'lightgray',
                                                                }}
                                                            >
                                                                <TableCell padding="dense">
                                                                    {nIndex + 1}
                                                                </TableCell>
                                                                <TableCell
                                                                    padding="none"
                                                                    className="notranslate"
                                                                >
                                                                    {
                                                                        n.data
                                                                            .country
                                                                    }
                                                                </TableCell>
                                                                <TableCell padding="dense">
                                                                    {n.processed
                                                                        ? 'Processed'
                                                                        : 'Pending'}
                                                                </TableCell>
                                                                <TableCell
                                                                    padding="none"
                                                                    className="notranslate"
                                                                >
                                                                    {
                                                                        n.data
                                                                            .name
                                                                    }
                                                                </TableCell>
                                                                <TableCell padding="none" />
                                                                <TableCell
                                                                    padding="dense"
                                                                    className="notranslate"
                                                                    style={{
                                                                        fontSize:
                                                                            '10px',
                                                                    }}
                                                                >
                                                                    {
                                                                        n.data
                                                                            .address
                                                                    }
                                                                </TableCell>
                                                                <TableCell padding="dense">
                                                                    No Match
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }

                                                    const matchedData = [
                                                        {},
                                                        {},
                                                    ].concat(n.matched);
                                                    return matchedData.map((m, i) => {
                                                        if (i === 0) {
                                                            return (
                                                                <TableRow
                                                                    key={`${
                                                                        m._id
                                                                    }_first`}
                                                                    style={{
                                                                        background:
                                                                                'lightgray',
                                                                    }}
                                                                >
                                                                    <TableCell
                                                                        padding="dense"
                                                                        className="notranslate"
                                                                    >
                                                                        {nIndex +
                                                                                1}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        padding="none"
                                                                        className="notranslate"
                                                                    >
                                                                        {
                                                                            n
                                                                                .data
                                                                                .country
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell padding="dense">
                                                                        {n.processed
                                                                            ? 'Processed'
                                                                            : 'Pending'}
                                                                    </TableCell>
                                                                    <TableCell
                                                                        padding="none"
                                                                        className="notranslate"
                                                                    >
                                                                        {
                                                                            n
                                                                                .data
                                                                                .name
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell padding="none" />
                                                                    <TableCell
                                                                        padding="dense"
                                                                        className="notranslate"
                                                                        style={{
                                                                            fontSize:
                                                                                    '10px',
                                                                        }}
                                                                    >
                                                                        {
                                                                            n
                                                                                .data
                                                                                .address
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell padding="dense">
                                                                        <IconButton
                                                                            aria-label="expand-more"
                                                                            onClick={this.toggleRow(n._id)}
                                                                            className={
                                                                                n.hidden
                                                                                    ? 'expand'
                                                                                    : 'expandOpen'
                                                                            }
                                                                        >
                                                                            <ExpandMoreIcon />
                                                                        </IconButton>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        }
                                                        if (!n.hidden) {
                                                            if (i === 1) {
                                                                return (
                                                                    <TableRow
                                                                        key={`${
                                                                            m._id
                                                                        }_second`}
                                                                    >
                                                                        <TableCell padding="dense" />
                                                                        <TableCell padding="none" />
                                                                        <TableCell padding="dense" />
                                                                        <TableCell
                                                                            padding="none"
                                                                            style={
                                                                                styles.header
                                                                            }
                                                                        >
                                                                                Matched
                                                                                Name
                                                                        </TableCell>
                                                                        <TableCell padding="none" />
                                                                        <TableCell
                                                                            padding="dense"
                                                                            style={
                                                                                styles.header
                                                                            }
                                                                        >
                                                                                Matched
                                                                                Address
                                                                        </TableCell>
                                                                        <TableCell
                                                                            padding="dense"
                                                                            style={
                                                                                styles.header
                                                                            }
                                                                        >
                                                                                Actions
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }
                                                            if (i !== 1) {
                                                                const exactMatch =
                                                                        m.name ===
                                                                            n
                                                                                .data
                                                                                .name &&
                                                                        m.address ===
                                                                            n
                                                                                .data
                                                                                .address;
                                                                return (
                                                                    <TableRow
                                                                        key={
                                                                            m._id
                                                                        }
                                                                    >
                                                                        <TableCell padding="dense" />
                                                                        <TableCell padding="none" />
                                                                        <TableCell padding="dense" />
                                                                        <TableCell
                                                                            padding="none"
                                                                            className="notranslate"
                                                                        >
                                                                            {
                                                                                m.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell
                                                                            padding="none"
                                                                            className="notranslate"
                                                                            style={{
                                                                                fontSize:
                                                                                        '10px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                m
                                                                                    .nameId
                                                                                    ._id
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell
                                                                            padding="dense"
                                                                            className="notranslate"
                                                                            style={{
                                                                                fontSize:
                                                                                        '10px',
                                                                            }}
                                                                        >
                                                                            {
                                                                                m.address
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell padding="dense">
                                                                            <ShowOnly
                                                                                if={
                                                                                    n.processed !==
                                                                                        undefined
                                                                                }
                                                                            >
                                                                                <ShowOnly
                                                                                    if={
                                                                                        exactMatch
                                                                                    }
                                                                                    className="display-flex"
                                                                                >
                                                                                        Exact
                                                                                        Match
                                                                                </ShowOnly>
                                                                                <ShowOnly
                                                                                    if={
                                                                                        m.confirm ===
                                                                                                undefined &&
                                                                                            !exactMatch
                                                                                    }
                                                                                >
                                                                                    <div className="display-flex">
                                                                                        <Button
                                                                                            size="small"
                                                                                            variant="outlined"
                                                                                            color="primary"
                                                                                            className="outlined-button"
                                                                                            disableRipple
                                                                                            style={{
                                                                                                boxShadow:
                                                                                                        'none',
                                                                                            }}
                                                                                            onClick={this.confirmDenyMatch(
                                                                                                true,
                                                                                                n._id,
                                                                                                m._id,
                                                                                            )}
                                                                                        >
                                                                                                Confirm
                                                                                        </Button>
                                                                                        <Button
                                                                                            size="small"
                                                                                            className="margin-left-16"
                                                                                            onClick={this.confirmDenyMatch(
                                                                                                false,
                                                                                                n._id,
                                                                                                m._id,
                                                                                            )}
                                                                                        >
                                                                                                Deny
                                                                                        </Button>
                                                                                    </div>
                                                                                </ShowOnly>
                                                                                <ShowOnly
                                                                                    if={
                                                                                        !exactMatch &&
                                                                                            (m.confirm ||
                                                                                                m.confirm ===
                                                                                                    false)
                                                                                    }
                                                                                    className="display-flex"
                                                                                >
                                                                                    {m.confirm
                                                                                        ? 'Confirmed'
                                                                                        : 'Denied'}
                                                                                </ShowOnly>
                                                                            </ShowOnly>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }
                                                        }
                                                        return (
                                                            <TableRow
                                                                key={`${
                                                                    m._id
                                                                }_empty`}
                                                                style={{
                                                                    display:
                                                                            'none',
                                                                }}
                                                            />
                                                        );
                                                    });
                                                })}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TablePagination
                                                    colSpan={3}
                                                    count={data.length}
                                                    rowsPerPage={rowsPerPage}
                                                    page={page}
                                                    onChangePage={
                                                        this.handleChangePage
                                                    }
                                                    onChangeRowsPerPage={
                                                        this
                                                            .handleChangeRowsPerPage
                                                    }
                                                    ActionsComponent={
                                                        TablePaginationWrapper
                                                    }
                                                    rowsPerPageOptions={[
                                                        100,
                                                        300,
                                                        500,
                                                    ]}
                                                />
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </Paper>
                            </Grid>
                        </ShowOnly>
                    </Grid>
                </AppGrid>
            </ShowOnly>
        );
    }
}

Lists.propTypes = {
    user: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    lists: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Lists);
