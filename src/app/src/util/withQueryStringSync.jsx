import React, { Component } from 'react';
import { connect } from 'react-redux';
import { func, shape, string } from 'prop-types';

import { setFiltersFromQueryString } from '../actions/filters';

import {
    fetchFacilities,
    resetFacilities,
} from '../actions/facilities';

import { filtersPropType } from '../util/propTypes';

import { createQueryStringFromSearchFilters } from '../util/util';

export default function withQueryStringSync(WrappedComponent) {
    const componentWithWrapper = class extends Component {
        componentDidMount() {
            const {
                history: {
                    replace,
                    location: {
                        search,
                        pathname,
                    },
                },
                match: {
                    path,
                },
                filters,
                hydrateFiltersFromQueryString,
            } = this.props;

            // This check returns null when the component mounts on the facility details route
            // with a path like /facilities/hello-world?name=facility to stop all facilities
            // from loading in the background and superseding single facility for the details
            // page.
            //
            // In that case, `path` will be `/facilities` and `pathname` will be
            // `/facilities/hello-world`. In other cases -- `/` and `/facilities` -- these paths
            // will match.
            const fetchFacilitiesOnMount = (pathname === path);

            return search
                ? hydrateFiltersFromQueryString(search, fetchFacilitiesOnMount)
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
            hydrateFiltersFromQueryString: (qs, fetch = true) => {
                dispatch(setFiltersFromQueryString(qs));

                return fetch
                    ? dispatch(fetchFacilities())
                    : null;
            },
            clearFacilities: () => dispatch(resetFacilities()),
        };
    }

    return connect(mapStateToProps, mapDispatchToProps)(componentWithWrapper);
}
