// This was adapted from the TypeScript "Multi-selct text input" example from
// https://react-select.com/creatable. We modified the state and change
// notification to work like the other CreatableSelect components in use.

import React, { Component } from 'react';

import CreatableSelect from 'react-select/creatable';
import SearchIcon from './SearchIcon';

const components = {
    DropdownIndicator: () => (
        <div
            style={{
                display: 'flex',
                marginRight: '0.5em',
            }}
        >
            <SearchIcon />
        </div>
    ),
    IndicatorSeparator: null,
};

const createOption = label => ({
    label,
    value: label,
});

export default class CreatableInputOnly extends Component {
    state = {
        inputValue: '',
    };

    handleChange = value => {
        const { onChange } = this.props;
        onChange(value);
    };

    handleInputChange = inputValue => {
        this.setState({ inputValue });
    };

    handleKeyDown = event => {
        const { inputValue } = this.state;
        const { onChange, value } = this.props;
        if (!inputValue) return;
        if (event.key === 'Enter' || event.key === 'Tab') {
            this.setState({
                inputValue: '',
            });
            onChange([...value, createOption(inputValue)]);
            event.preventDefault();
        }
    };

    handleBlur = () => {
        const { inputValue } = this.state;
        const { onChange, value } = this.props;
        if (!inputValue) return;
        this.setState({
            inputValue: '',
        });
        onChange([...value, createOption(inputValue)]);
    };

    render() {
        const { inputValue } = this.state;
        const { value, ...rest } = this.props;
        return (
            <CreatableSelect
                components={components}
                inputValue={inputValue}
                isClearable
                isMulti
                menuIsOpen={false}
                onChange={this.handleChange}
                onInputChange={this.handleInputChange}
                onKeyDown={this.handleKeyDown}
                onBlur={this.handleBlur}
                placeholder={this.props.placeholder}
                value={value}
                {...rest}
            />
        );
    }
}
