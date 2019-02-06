import React, { Component } from 'react';
import { connect } from 'react-redux';
import { func, shape, string } from 'prop-types';

import { setFiltersFromQueryString } from '../actions/filters';

import {
    fetchFacilities,
    resetFacilities,
} from '../actions/facilities';

import { filtersPropType } from '../util/propTypes';

import {
    createQueryStringFromSearchFilters,
    allFiltersAreEmpty,
} from '../util/util';

export default function withQueryStringSync(WrappedComponent) {
    const componentWithWrapper = class extends Component {
        componentDidMount() {
            const {
                history: {
                    replace,
                    location: {
                        search,
                    },
                },
                filters,
                hydrateFiltersFromQueryString,
            } = this.props;

            return (search && allFiltersAreEmpty(filters))
                ? hydrateFiltersFromQueryString(search)
                : replace(`?${createQueryStringFromSearchFilters(filters)}`);
        }

        componentDidUpdate() {
            const {
                filters,
                history: {
                    replace,
                    location: {
                        search,
                    },
                },
            } = this.props;

            const newQueryString = `?${createQueryStringFromSearchFilters(filters)}`;

            if (search === newQueryString) {
                return null;
            }

            if (!search && newQueryString.length === 1) {
                return null;
            }

            return replace(newQueryString);
        }

        componentWillUnmount() {
            return this.props.clearFacilities();
        }

        render() {
            return <WrappedComponent {...this.props} />;
        }
    };

    componentWithWrapper.propTypes = {
        filters: filtersPropType.isRequired,
        hydrateFiltersFromQueryString: func.isRequired,
        clearFacilities: func.isRequired,
        history: shape({
            replace: func.isRequired,
            location: shape({
                search: string.isRequired,
            }),
        }).isRequired,
    };

    function mapStateToProps({
        filters,
    }) {
        return {
            filters,
        };
    }

    function mapDispatchToProps(dispatch) {
        return {
            hydrateFiltersFromQueryString: (qs) => {
                dispatch(setFiltersFromQueryString(qs));
                return dispatch(fetchFacilities());
            },
            clearFacilities: () => dispatch(resetFacilities()),
        };
    }

    return connect(mapStateToProps, mapDispatchToProps)(componentWithWrapper);
}
