// This was adapted from the TypeScript "Multi-selct text input" example from
// https://react-select.com/creatable. We modified the state and change
// notification to work like the other CreatableSelect components in use.

import React, { Component } from 'react';

import CreatableSelect from 'react-select/creatable';

const components = {
    DropdownIndicator: null,
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

    handleInputChange = (inputValue: string) => {
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

    render() {
        const { inputValue } = this.state;
        const { value } = this.props;
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
                placeholder={this.props.placeholder}
                value={value}
            />
        );
    }
}
