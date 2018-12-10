import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ShowOnly from '../ShowOnly'
import TextInput from './TextInput'

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
    overflowY: 'scroll'
  },
  option: {
    cursor: 'pointer'
  }
}

class SelectInput extends Component {
  state = {
    open: false,
    value: this.props.initialValue || ''
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.initialValue !== this.props.initialValue) {
      this.setState({ value: nextProps.initialValue })
    }
  }

  select = o => () => {
    this.props.onChange({ target: { value: o } })
    this.setState({ value: o }, this.toggleSelect)
  }

  toggleSelect = () => this.setState(state => ({ open: !state.open }))

  render() {
    const { options, placeholder, disabled } = this.props
    const { open, value } = this.state
    return (
      <span>
        <ShowOnly if={ !disabled }>
          <div style={{ position: 'relative' }}>
            <p role="presentation" onClick={ this.toggleSelect } className="form__select-input-container">{ value || placeholder }</p>
            <ShowOnly if={ open } style={ styles.dropdown }>
              { options.map(o => <div role="presentation" key={ o } onClick={ this.select(o) } className="form__select-input--selected">{ o }</div>) }
            </ShowOnly>
          </div>
        </ShowOnly>
        <ShowOnly if={ disabled }>
          <TextInput
            placeholder="Contributor Type"
            value={ value }
            disabled
          />
        </ShowOnly>
      </span>
    )
  }
}

SelectInput.propTypes = {
  options: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  disabled: PropTypes.bool
}

SelectInput.defaultProps = {
  placeholder: 'Please Select',
  initialValue: '',
  disabled: false
}

export default SelectInput
