/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import { parse } from 'json2csv';
import CircularProgress from '@material-ui/core/CircularProgress';
import FactoryInfo from '../components/FactoryInfo';
import ShowOnly from '../components/ShowOnly';
import countries from '../data/countries.json';
import * as sourceActions from '../actions/source';

import {
    DownloadCSV,
    makeAllSourceURL,
    makeAllCountryURL,
    makeTotalFacilityURL,
    makeSearchFacilityByNameAndCountryURL,
} from '../util/util';


const defaultContainer = ({ children }) => (
    <div className="control-panel">{children}</div>
);
const TabContainer = props => (
    <Typography component="div">{props.children}</Typography>
);

const mapStateToProps = state => ({
    source: state.source,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(sourceActions, dispatch),
});

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

defaultContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

class ControlPanel extends PureComponent {
    state = {
        factories: [],
        factoriesRes: '',
        factoriesList: [],
        showFacroiesList: false,
        name: '',
        country: [],
        contributor: [],
        contributorType: [],
        tabValue: 1,
        sources: [],
        countries: [],
        isSpinning: false,
        totalFactories: 54346,
    };

    componentDidMount() {
        const { factories, sharedSearch } = this.props;
        /* eslint-disable react/no-did-mount-set-state */
        fetch(makeAllSourceURL())
            .then(response => response.json())
            .then((data) => {
                const sources = data.sources
                    .filter(s => s.name)
                    .map(({
                        name, _id, uid, list, user_type, // eslint-disable-line camelcase
                    }) => ({
                        name,
                        _id,
                        uid,
                        list,
                        user_type,
                    }));
                this.setState({ sources });
                this.props.actions.setSource(sources);
            });

        fetch(makeAllCountryURL())
            .then(response => response.json())
            .then((data) => {
                const countryNames = data.countries
                    .map((s) => {
                        const cname = countries.find(c => c.code === s);
                        return cname;
                    })
                    .filter(co => co !== undefined);
                this.setState({
                    countries: countryNames,
                });
            });

        fetch(makeTotalFacilityURL())
            .then(response => response.json())
            .then((data) => {
                if (data && data.total) {
                    this.setState({
                        totalFactories: data.total,
                    });
                }
            });

        if (factories.length) {
            this.setState({
                factories,
                factoriesRes: this.createfactoriesRes(factories),
                factoriesList: this.createfactoriesList(factories),
            });
        }
        if (Object.keys(sharedSearch).length) {
            this.handleSharedUrl(sharedSearch);
        }
        /* eslint-enable react/no-did-mount-set-state */
    }

    onChildClear = () => this.props.onClearSelectedFac();

    onSelectFactory = id => this.props.onSelectFactory(id);

    // Sort countries alphabetically
    sortedCountries = () =>
        this.state.countries
            .sort((a, b) => {
                const aName = a.names ? a.names[0] : a.name;
                const bName = b.names ? b.names[0] : b.name;
                return aName.toLowerCase().localeCompare(bName.toLowerCase());
            })
            .map(c => (
                <MenuItem value={c.code} key={c.code}>
                    <Checkbox
                        color="primary"
                        checked={this.state.country.indexOf(c.code) > -1}
                    />
                    <ListItemText primary={c.names ? c.names[0] : c.name} />
                </MenuItem>
            ));

    checkboxSources = () =>
        this.state.sources
            .sort((a, b) =>
                a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
            .map(c => (
                <MenuItem value={c._id} key={c._id}>
                    <Checkbox
                        color="primary"
                        checked={this.state.contributor.indexOf(c._id) > -1}
                    />
                    <ListItemText primary={c.name} className="notranslate" />
                </MenuItem>
            ));

    sourcesTypes = () =>
        _.uniqBy(
            this.state.sources
                .filter(s => s.user_type !== null && s.user_type !== undefined)
                .sort((a, b) =>
                    a.user_type
                        .toLowerCase()
                        .localeCompare(b.user_type.toLowerCase())),
            'user_type',
        ).map(c => (
            <MenuItem value={c.user_type} key={c.user_type}>
                <Checkbox
                    color="primary"
                    checked={
                        this.state.contributorType.indexOf(c.user_type) > -1
                    }
                />
                <ListItemText primary={c.user_type} className="notranslate" />
            </MenuItem>
        ));

    // If someone has pasted a url into the browser, search OAR with the provided
    // parameters
    handleSharedUrl = ({
        name, contributor, country, factory,
    }) =>
        this.setState(
            {
                name: name || '',
                contributor:
                    contributor && contributor.split(',')
                        ? contributor.split(',')
                        : [],
                country:
                    country && country.split(',') ? country.split(',') : [],
                tabValue: 1,
            },
            () => this.searchFactory({ preventDefault: () => {} }, factory),
        );

    updateInputField = field => (event) => {
        const attribute = {};
        attribute[field] = event.target.value;
        this.setState(attribute);
    };

    searchFactory = (e, specificFactory) => {
        e.preventDefault();

        const {
            name, country, contributor, contributorType,
        } = this.state;

        this.setState({ isSpinning: true });

        if (contributor && contributor.length > 0) {
            this.props.updateSearchButton(name, country, contributor);
        }

        fetch(makeSearchFacilityByNameAndCountryURL(name, country, contributor))
            .then(results => results.json())
            .then((data) => {
                if (
                    !data ||
                    !Array.isArray(data) ||
                    !data.length ||
                    data.length <= 0
                ) {
                    this.setState({
                        factories: [],
                        factoriesRes: this.createfactoriesRes([]),
                        factoriesList: [],
                        isSpinning: false,
                    });
                    this.props.onUpdate([]);
                    return;
                }

                // Use lodash includes instead because ie 11 doesn't support native .includes
                // Filter out factories that don't have searched key word in their name
                let factories = !name
                    ? data
                    : data.filter(f =>
                        _.includes(
                            f.name.toLowerCase(),
                            name.toLowerCase(),
                        ) || _.includes(f.otherNames, name));
                // Filter out factories that don't have the contributors in their source
                if (contributor && contributor.length > 0) {
                    // factories = factories.filter(f => f.source.some((s => _.includes(contributor, s._id)))) eslint-disable max-len
                    factories = factories.filter((f) => {
                        const fSourceId = f.source.map(s => s._id);
                        return (
                            _.difference(contributor, fSourceId).length === 0
                        );
                    });
                }

                // Filter out factories that don't have contributor types, $and filter, has type A and type B for their sources[] eslint-disable max-len
                if (contributorType && contributorType.length > 0) {
                    factories = factories.filter((f) => {
                        if (!f.source || f.source.length <= 0) return false;
                        const fSourceTypes = f.source.map(s => s.user_type || null);
                        return (
                            _.difference(contributorType, fSourceTypes)
                                .length === 0
                        );
                    });
                }

                if (!factories && factories.length <= 0) {
                    this.setState({
                        factories,
                        factoriesRes: this.createfactoriesRes([]),
                        factoriesList: [],
                        isSpinning: false,
                    });
                    this.props.onUpdate([]);
                    return;
                }

                const factoriesRes = this.createfactoriesRes(factories);
                const factoriesList = this.createfactoriesList(factories);

                this.setState(
                    {
                        factories,
                        factoriesRes,
                        factoriesList,
                        isSpinning: false,
                    },
                    () => {
                        this.props.onUpdate(factories);
                    },
                );

                if (specificFactory) {
                    this.props.setSpecificFactory(specificFactory);
                }
            });
    };

    createfactoriesRes = (factories) => {
        const { totalFactories } = this.state;

        if (!factories.length) {
            return <div> There were no results for this search. </div>;
        }

        if (
            !this.state.name &&
            !this.state.contributor.length &&
            !this.state.country.length &&
            !this.state.contributorType.length
        ) {
            return (
                <div className="control-panel__group">
                    <h1 className="control-panel__heading">SEARCH RESULTS:</h1>
                    <p className="helper-text">
                        Your search criteria was too broad. Results are limited
                        to {factories.length} Facilities of {totalFactories}{' '}
                        Total Facilities.
                    </p>
                </div>
            );
        }

        return (
            <div className="control-panel__group">
                <h1 className="control-panel__heading">SEARCH RESULTS:</h1>
                <p className="helper-text">
                    Found {factories.length} Facilities of {totalFactories}{' '}
                    Total Facilities.
                </p>
            </div>
        );
    };

    createfactoriesList = (factories) => {
        if (!factories || factories.length <= 0) return [];
        if (process.env.REACT_APP_CLICKABLE_LIST) {
            return factories.map((f, i) => (
                <p
                    className={
                        i === factories.length - 1
                            ? 'notranslate link-underline cursor margin-bottom-64'
                            : 'notranslate link-underline cursor'
                    }
                    role="presentation"
                    onClick={() => this.onSelectFactory(f.uniqueId)}
                    key={f.uniqueId}
                >
                    {f.name}
                </p>
            ));
        }
        return factories.map((f, i) => (
            <p
                className={
                    i === factories.length - 1
                        ? 'notranslate margin-bottom-64'
                        : 'notranslate'
                }
                key={f.uniqueId}
            >
                {f.name}
            </p>
        ));
    };

    handleTabChange = (event, tabValue) => this.setState({ tabValue });

    // Recursively flattens an array down to a deepness of 1
    flatten = array =>
        array.reduce(
            (acc, val) =>
                (Array.isArray(val)
                    ? acc.concat(this.flatten(val))
                    : acc.concat(val)),
            [],
        );

    factoriesCSV = () =>
        parse(this.props.factories, {
            fields: ['nameId', 'longitude', 'latitude', 'name', 'address'],
        });

    convertIdToName = (ids) => {
        const sources = this.state.sources.filter(s => ids.indexOf(s._id) > -1);
        return sources.map(s => s.name);
    };

    convertCodeToName = (codes) => {
        const filteredCountries = this.state.countries.filter(s => codes.indexOf(s.code) > -1);
        return filteredCountries.map(s => (s.name ? s.name : s.names[0]));
    };

    resetSearch = () =>
        this.setState(
            {
                name: '',
                contributor: [],
                contributorType: [],
                country: [],
                factories: [],
                factoriesRes: '',
                factoriesList: [],
                isSpinning: false,
                showFacroiesList: false,
            },
            () => {
                this.props.onUpdate([]);
            },
        );

    toggleList = () => {
        const { showFacroiesList } = this.state;
        this.setState({ showFacroiesList: !showFacroiesList });
    };

    render() {
        const { selectedFactory, factories } = this.props;
        const Container = defaultContainer;

        const selectFac = selectedFactory
            ? factories.find(f => f.uniqueId === selectedFactory)
            : null;

        const {
            tabValue,
            factoriesRes,
            factoriesList,
            showFacroiesList,
        } = this.state;

        return (
            <Container>
                <ShowOnly when={!!selectedFactory}>
                    <FactoryInfo
                        info={selectFac}
                        onClearSelection={this.onChildClear}
                    />
                </ShowOnly>
                <ShowOnly when={!selectedFactory}>
                    <div className="panel-header">
                        <h3 className="panel-header__title">
                            Open Apparel Registry
                        </h3>
                        <p className="panel-header__subheading">
                            The open map of global apparel factories.
                        </p>
                    </div>
                    <AppBar position="static">
                        <Tabs
                            value={tabValue}
                            onChange={this.handleTabChange}
                            classes={{
                                root: 'tabs',
                                indicator: 'tabs-indicator-color',
                            }}
                        >
                            <Tab label="Guide" className="tab-minwidth" />
                            <Tab label="Search" className="tab-minwidth" />
                        </Tabs>
                    </AppBar>
                    <ShowOnly when={tabValue === 0}>
                        <TabContainer>
                            <div className="control-panel__content">
                                <p className="control-panel__body">
                                    The Open Apparel Registry (OAR) is a tool to
                                    identify every apparel facility worldwide.
                                    It is an open sourced, global database of
                                    apparel (garments, footwear and accessories)
                                    facility names and locations. The tool
                                    normalizes uploaded data - specifically
                                    facility names and addresses - submitted by
                                    contributors such as brands, industry
                                    associations and non-profits and assigns
                                    each facility a unique OAR ID number. Each
                                    contributor is listed next to every facility
                                    it has submitted.
                                </p>
                                <p className="control-panel__body">
                                    To contribute to the database, users must
                                    create an account. Anyone can sign up and
                                    contribute. Users interested in browsing the
                                    OAR are able to access it freely without
                                    creating an account.
                                </p>
                                <a
                                    href="http://info.openapparel.org/about"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-underline"
                                >
                                    Learn More
                                </a>
                            </div>
                        </TabContainer>
                    </ShowOnly>
                    <ShowOnly when={tabValue === 1}>
                        <TabContainer>
                            <div className="control-panel__content">
                                <form onSubmit={this.searchFactory}>
                                    <div className="form__field">
                                        <InputLabel className="form__label">
                                            Search a Facility Name
                                        </InputLabel>
                                        <TextField
                                            id="name"
                                            placeholder="Facility Name"
                                            className="full-width margin-bottom-16 form__text-input"
                                            value={this.state.name}
                                            onChange={this.updateInputField('name')}
                                        />
                                    </div>

                                    <FormControl
                                        style={{
                                            width: '100%',
                                            marginBottom: '32px',
                                        }}
                                    >
                                        <InputLabel
                                            shrink={false}
                                            htmlFor="contributor"
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: '#000',
                                                transform:
                                                    'translate(0, -8px) scale(1)',
                                            }}
                                        >
                                            Filter by Contributor
                                        </InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.contributor}
                                            onChange={this.updateInputField('contributor')}
                                            name="contributor"
                                            className="full-width margin-top-16 margin-bottom-16 notranslate"
                                            input={
                                                <Input
                                                    name="contributor"
                                                    id="contributor"
                                                    className="notranslate"
                                                />
                                            }
                                            renderValue={(selected) => {
                                                const selectedNames = this.convertIdToName(selected);
                                                return selectedNames.join(', ');
                                            }}
                                            MenuProps={{
                                                style: {
                                                    maxHeight: '50vh',
                                                },
                                            }}
                                        >
                                            {this.checkboxSources()}
                                        </Select>
                                    </FormControl>
                                    <br />

                                    <FormControl
                                        style={{
                                            width: '100%',
                                            marginBottom: '32px',
                                        }}
                                    >
                                        <InputLabel
                                            shrink={false}
                                            htmlFor="contributor_type"
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: '#000',
                                                transform:
                                                    'translate(0, -8px) scale(1)',
                                            }}
                                        >
                                            Filter by Contributor Type
                                        </InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.contributorType}
                                            onChange={this.updateInputField('contributorType')}
                                            name="contributorType"
                                            className="full-width margin-top-16 margin-bottom-16 notranslate"
                                            input={
                                                <Input
                                                    name="contributorType"
                                                    id="contributorType"
                                                    className="notranslate"
                                                />
                                            }
                                            renderValue={selected =>
                                                selected.join(', ')
                                            }
                                            MenuProps={{
                                                style: {
                                                    maxHeight: '50vh',
                                                },
                                            }}
                                        >
                                            {this.sourcesTypes()}
                                        </Select>
                                    </FormControl>
                                    <br />

                                    <FormControl style={{ width: '100%' }}>
                                        <InputLabel
                                            shrink={false}
                                            htmlFor="country"
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: '#000',
                                                transform:
                                                    'translate(0, -8px) scale(1)',
                                            }}
                                        >
                                            Filter by Country
                                        </InputLabel>
                                        <Select
                                            multiple
                                            value={this.state.country}
                                            onChange={this.updateInputField('country')}
                                            name="country"
                                            className="full-width margin-top-16 margin-bottom-16"
                                            input={
                                                <Input
                                                    name="country"
                                                    id="country"
                                                />
                                            }
                                            renderValue={(selected) => {
                                                const selectedNames = this.convertCodeToName(selected);
                                                return selectedNames.join(', ');
                                            }}
                                            MenuProps={{
                                                style: {
                                                    maxHeight: '50vh',
                                                },
                                            }}
                                        >
                                            {this.sortedCountries()}
                                        </Select>
                                    </FormControl>
                                    <br />

                                    <div className="form__action">
                                        <a
                                            className="control-link"
                                            href="mailto:info@openapparel.org?subject=Reporting an issue"
                                        >
                                            Report an issue
                                        </a>
                                        <div className="offset offset-right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={this.resetSearch}
                                                disableRipple
                                                color="primary"
                                                className="outlined-button"
                                            >
                                                Reset
                                            </Button>
                                            {this.state.isSpinning ? (
                                                <CircularProgress
                                                    size={30}
                                                    className="margin-left-16"
                                                />
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    type="submit"
                                                    color="primary"
                                                    className="margin-left-16 blue-background"
                                                    style={{
                                                        boxShadow: 'none',
                                                    }}
                                                >
                                                    Search
                                                    {/* <Icon>search</Icon> */}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </form>

                                {factoriesRes}

                                <ShowOnly when={this.state.factories.length > 0}>
                                    <div className="control-panel__action control-panel__action--center">
                                        <div className="offset offset-right">
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={this.toggleList}
                                                className="blue-color notranslate"
                                                disableRipple
                                            >
                                                <ShowOnly
                                                    when={!showFacroiesList}
                                                >
                                                    VIEW{' '}
                                                </ShowOnly>
                                                <ShowOnly when={showFacroiesList}>
                                                    HIDE{' '}
                                                </ShowOnly>
                                                FACILITY LIST
                                            </Button>
                                            <Button
                                                className="blue-color margin-left-16"
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                disableRipple
                                                onClick={() =>
                                                    DownloadCSV(
                                                        this.factoriesCSV(),
                                                        'factories.csv',
                                                    )
                                                }
                                            >
                                                DOWNLOAD CSV
                                            </Button>
                                        </div>
                                    </div>
                                    <ShowOnly when={showFacroiesList}>
                                        <div className="control-panel__scroll">
                                            {factoriesList}
                                        </div>
                                    </ShowOnly>
                                </ShowOnly>
                            </div>
                        </TabContainer>
                    </ShowOnly>
                    <ShowOnly when={tabValue === 2}>
                        <TabContainer>
                            <div className="padding-all" />
                        </TabContainer>
                    </ShowOnly>
                </ShowOnly>
            </Container>
        );
    }
}

ControlPanel.propTypes = {
    factories: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
    sharedSearch: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    onClearSelectedFac: PropTypes.func.isRequired,
    updateSearchButton: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSelectFactory: PropTypes.func.isRequired,
    setSpecificFactory: PropTypes.func.isRequired,
    selectedFactory: PropTypes.string,
    actions: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

ControlPanel.defaultProps = {
    sharedSearch: {},
    selectedFactory: null,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ControlPanel);
