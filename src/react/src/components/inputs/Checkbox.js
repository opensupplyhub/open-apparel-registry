import React, { PureComponent } from 'react'
import MaterialCheckbox from '@material-ui/core/Checkbox'
import PropTypes from 'prop-types'

const styles = {
  p: {
    display: 'inline-block',
    margin: '8px 0'
  },
  checkbox: {
    marginLeft: '-15px'
  }
}

class Checkbox extends PureComponent {
  render() {
    const { onChange, text, link } = this.props

    return (
      <div>
        <MaterialCheckbox color="primary" onChange={ onChange } style={ styles.checkbox } />
        <p style={ styles.p }>{ text }
          { link
            && (
              <a target="_blank" rel="noopener noreferrer" className="link-underline" href={ link.url }>{ link.text }</a>
            )
          }
        </p>
      </div>
    )
  }
}

Checkbox.propTypes = {
  onChange: PropTypes.func,
  text: PropTypes.string.isRequired,
  link: PropTypes.object
}

Checkbox.defaultProps = {
  onChange: () => {},
  link: {}
}

export default Checkbox
