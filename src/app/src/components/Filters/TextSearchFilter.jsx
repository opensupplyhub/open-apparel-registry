import React from 'react';
import { func, string } from 'prop-types';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import InputLabel from '@material-ui/core/InputLabel';
import { withStyles } from '@material-ui/core/styles';

import { updateFacilityFreeTextQueryFilter } from '../../actions/filters';
import { makeFilterStyles } from '../../util/styles';

import {
    getValueFromEvent,
    makeSubmitFormOnEnterKeyPressFunction,
} from '../../util/util';

import { DEFAULT_SEARCH_TEXT } from '../../util/constants';

const FACILITIES = 'FACILITIES';

function TextSearchFilter({
    facilityFreeTextQuery,
    updateFacilityFreeTextQuery,
    searchForFacilities,
    submitFormOnEnterKeyPress,
    classes,
    searchLabel,
    marginTop,
}) {
    return (
        <div className="form__field" style={{ marginTop }}>
            <InputLabel
                shrink={false}
                htmlFor={FACILITIES}
                className={classes.inputLabelStyle}
            >
                {searchLabel}
            </InputLabel>
            <TextField
                id={FACILITIES}
                placeholder="e.g. ABC Textiles Limited"
                value={facilityFreeTextQuery}
                onChange={updateFacilityFreeTextQuery}
                onKeyPress={submitFormOnEnterKeyPress}
                variant="outlined"
                margin="dense"
                style={{
                    display: 'flex',
                }}
                InputProps={{
                    endAdornment: (
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
        marginTop: embed ? '36px' : 0,
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
)(withStyles(makeFilterStyles)(TextSearchFilter));
