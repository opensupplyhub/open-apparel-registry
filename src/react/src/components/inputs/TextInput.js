import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import ShowOnly from '../ShowOnly'
import '../../styles/css/specialStates.css'


class TextInput extends PureComponent {
  render() {
    const {
      name, placeholder, type, hint, style, ...rest
    } = this.props

    return (
      <div>
        <ShowOnly if={ !!hint }>
          <p className="form__hint">{ hint }</p>
        </ShowOnly>
        <input
          type={ type }
          name={ name }
          placeholder={ placeholder }
          className="noFocus form__text-input"
          style={ Object.assign({}, style) }
          { ...rest }
        />
      </div>
    )
  }
}

TextInput.propTypes = {
  name: PropTypes.string,
  placeholder: PropTypes.string.isRequired,
  type: PropTypes.string,
  hint: PropTypes.string,
  style: PropTypes.object
}

TextInput.defaultProps = {
  type: 'text',
  name: '',
  hint: '',
  style: {}
}

export default TextInput
