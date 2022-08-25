import React from 'react';
import { func, string } from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { withStyles } from '@material-ui/core/styles';

import { updateFacilityFreeTextQueryFilter } from '../../actions/filters';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../../util/util';

import { DEFAULT_SEARCH_TEXT } from '../../util/constants';

const filterStyles = Object.freeze({
    searchInput: Object.freeze({
        backgroundColor: '#fff',
        paddingLeft: 0,
        borderRadius: 0,
    }),
    notchedOutline: {
        borderRadius: 0,
    },
});

const FACILITIES = 'FACILITIES';

function TextSearchFilter({
    facilityFreeTextQuery,
    updateFacilityFreeTextQuery,
    searchForFacilities,
    submitFormOnEnterKeyPress,
    classes,
    searchLabel,
}) {
    return (
        <div className="form__field" style={{ marginBottom: '10px' }}>
            <InputLabel htmlFor={FACILITIES} className="form__label">
                {searchLabel}
            </InputLabel>
            <TextField
                id={FACILITIES}
                placeholder="What are you looking for?"
                className="form__text-input"
                value={facilityFreeTextQuery}
                onChange={updateFacilityFreeTextQuery}
                onKeyPress={submitFormOnEnterKeyPress}
                variant="outlined"
                margin="dense"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={searchLabel}
                                onClick={searchForFacilities}
                            >
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                    classes: {
                        root: classes.searchInput,
                        notchedOutline: classes.notchedOutline,
                    },
                }}
            />
        </div>
    );
}

TextSearchFilter.propTypes = {
    updateFacilityFreeTextQuery: func.isRequired,
    facilityFreeTextQuery: string.isRequired,
    searchForFacilities: func.isRequired,
    submitFormOnEnterKeyPress: func.isRequired,
};

function mapStateToProps({
    filters: { facilityFreeTextQuery },
    embeddedMap: { embed, config },
}) {
    return {
        facilityFreeTextQuery,
        searchLabel: embed ? config.text_search_label : DEFAULT_SEARCH_TEXT,
        embedExtendedFields: config.extended_fields,
    };
}

function mapDispatchToProps(dispatch, { searchForFacilities }) {
    return {
        updateFacilityFreeTextQuery: e =>
            dispatch(updateFacilityFreeTextQueryFilter(getValueFromEvent(e))),

        submitFormOnEnterKeyPress: makeSubmitFormOnEnterKeyPressFunction(() =>
            searchForFacilities(),
        ),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withStyles(filterStyles)(TextSearchFilter));
