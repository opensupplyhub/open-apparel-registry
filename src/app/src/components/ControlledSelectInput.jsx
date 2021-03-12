import React, { Component } from 'react';
import { arrayOf, bool, func, string } from 'prop-types';
import ShowOnly from './ShowOnly';

const styles = {
    dropdown: {
        position: 'absolute',
        background: '#fff',
        width: '100%',
        border: '1px solid #1A237E',
        boxShadow: '0px 0px 8px -1px rgba(26, 35, 126,0.5)',
        boxSizing: 'border-box',
        zIndex: '100',
        top: '0',
        maxHeight: '200px',
        overflowY: 'scroll',
    },
    option: {
        cursor: 'pointer',
    },
};

export default class ControlledSelectInput extends Component {
    constructor(props) {
        super(props);
        this.state = { open: false };
    }

    makeSelection = selection => {
        this.props.handleChange(selection);
        return this.toggleSelect();
    };

    toggleSelect = () => this.setState(state => ({ open: !state.open }));

    render() {
        const {
            props: { options, value, disabled },
            state: { open },
        } = this;
        /* eslint-disable  jsx-a11y/no-noninteractive-tabindex */
        return (
            <span>
                <ShowOnly when={!disabled}>
                    <div style={{ position: 'relative' }}>
                        <p
                            role="presentation"
                            onClick={this.toggleSelect}
                            onKeyPress={this.toggleSelect}
                            className="form__select-input-container"
                            tabIndex={0}
                        >
                            {value || 'Please Select'}
                        </p>
                        <ShowOnly when={open} style={styles.dropdown}>
                            {options.map(opt => (
                                <div
                                    role="presentation"
                                    key={opt}
                                    onClick={() => this.makeSelection(opt)}
                                    onKeyPress={() => this.makeSelection(opt)}
                                    className="form__select-input--selected"
                                    tabIndex={0}
                                >
                                    {opt}
                                </div>
                            ))}
                        </ShowOnly>
                    </div>
                </ShowOnly>
            </span>
        );
        /* eslint-enable jsx-a11y/no-noninteractive-tabindex */
    }
}

ControlledSelectInput.defaultProps = {
    disabled: false,
};

ControlledSelectInput.propTypes = {
    options: arrayOf(string).isRequired,
    handleChange: func.isRequired,
    disabled: bool,
    value: string.isRequired,
};
