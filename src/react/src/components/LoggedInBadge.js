import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import COLOURS from '../util/COLOURS'
import NavbarDropdown from './NavbarDropdown'
import Translate from './Translate'
import * as navbarActions from '../actions/navbar'
import * as userActions from '../actions/user'
import '../styles/css/specialStates.css'

const mapStateToProps = state => ({
  nav: state.nav,
  user: state.user
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...userActions, ...navbarActions }, dispatch)
})

const styles = {
  logoContainer: {
    borderRadius: '100%',
    width: '40px',
    height: '40px',
    border: '2px solid',
    borderColor: COLOURS.GREY,
    marginRight: '10px',
    display: 'inline-flex',
    justifyContent: 'middle',
    overflow: 'hidden',
    cursor: 'pointer'
  },
  logoSpacer: {
    width: '30px',
    height: '30px',
    marginTop: '5px',
    marginLeft: '5px',
    display: 'inline-flex'
  },
  logo: {
    width: '100%',
    height: '100%',
    border: 'none',
    borderRadius: '100%'
  }
}

class LoggedInBadge extends PureComponent {
  render() {
    const { user, actions: { toggleUserDropdown, logOut } } = this.props

    const items = [
      { text: 'My Profile', url: `/profile/${user.uid}`, type: 'link' },
      { text: 'My Lists', url: '/lists', type: 'link' },
      { text: 'Log Out', type: 'button', action: logOut }
    ]

    return (
      <span style={{ display: 'inline-flex', justifyContent: 'middle' }} className="line-height">
        <Translate />
        <div style={ styles.logoContainer } onClick={ toggleUserDropdown } role="button" tabIndex={ 0 }>
          <div style={ styles.logoSpacer }>
            <img src={ user.photo } style={ styles.logo } alt="" />
          </div>
        </div>
        <NavbarDropdown
          title={ user.email.toUpperCase() }
          links={ items }
        />
      </span>
    )
  }
}

LoggedInBadge.propTypes = {
  user: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(LoggedInBadge)
