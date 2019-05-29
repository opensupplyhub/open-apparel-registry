import React, { useEffect, useState } from 'react';
import { func, string } from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Search from '@material-ui/icons/Search';
import Close from '@material-ui/icons/Close';

import { ENTER_KEY } from '../util/constants';

export default function FacilityListItemsTableSearch({
    currentValue,
    onSearch,
}) {
    const [searchText, setSearchText] = useState(currentValue);
    const isCurrent = searchText === currentValue;

    // Update internal state if the prop is updated
    useEffect(() => setSearchText(currentValue), [currentValue]);

    const handleSearch = () => {
        if (isCurrent) {
            return;
        }

        onSearch(searchText);
    };

    const handleTextChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleReset = () => {
        setSearchText('');
        onSearch('');
    };

    const handleTextKeyDown = (e) => {
        if (e.key === ENTER_KEY) {
            handleSearch();
        }
    };

    const searchButton = (
        <IconButton
            edge="end"
            aria-label="Search"
            onClick={handleSearch}
        >
            <Search />
        </IconButton>
    );
    const resetButton = (
        <IconButton
            edge="end"
            aria-label="Reset"
            onClick={handleReset}
        >
            <Close />
        </IconButton>
    );

    const adornment = (searchText !== '' && isCurrent)
        ? resetButton
        : searchButton;

    return (
        <TextField
            margin="dense"
            variant="outlined"
            type="text"
            label="Search"
            onChange={handleTextChange}
            onKeyDown={handleTextKeyDown}
            value={searchText}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        {adornment}
                    </InputAdornment>
                ),
            }}
        />
    );
}

FacilityListItemsTableSearch.propTypes = {
    currentValue: string,
    onSearch: func.isRequired,
};

FacilityListItemsTableSearch.defaultProps = {
    currentValue: '',
};
