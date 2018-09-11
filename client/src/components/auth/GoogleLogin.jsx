// Provide a button to login by directly calling the Google apis

// Based on github.com/kennetpostigo/react-google-login-component
// Google api info: developers.google.com/identity/sign-in/web/reference
// https://developers.google.com/identity/sign-in/web/backend-auth
// https://stackoverflow.com/questions/32150845/how-to-refresh-expired-google-sign-in-logins

/*
make logout work
auto refresh id_token after login
switch to local server
pass login info to server
update to server to validate against new info
make unit tests work (with new authentication)
*/
// Remove auth0 dependencies/code

/* global gapi */

import React from 'react'
import { Button } from 'react-bootstrap'
import { user } from './User.js'

const googleClientId = "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com"

export default class GoogleLogin extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      disabled: true
    }
  }

  componentDidMount() {
    const id = 'google-platform'
    
    // If it does not already exist create a new script element and load the
    // google api code. Has side effect of defining 'gapi'
    const loadGoogleApiScript = (callback) => {
        let gs = document.getElementsByTagName('script')[0]
      if (document.getElementById(id)) { 
        this.setState({ disabled: false })
        return
      }

      let js = document.createElement('script')
      js.id = id
      js.src = 'https://apis.google.com/js/platform.js' // google api script
      gs.parentNode.insertBefore(js, gs)
      js.onload = callback
    }
    
    const loadAuth2 = () => {
      gapi.load('auth2', () => {
        this.setState({ disabled: false })

        if (!gapi.auth2.getAuthInstance()) {
          gapi.auth2.init({
            client_id: googleClientId,
            fetch_basic_profile: false,
            scope: 'profile'
          })
        }

        refresh(user.setIdToken.bind(user))
      })
    }

    loadGoogleApiScript(loadAuth2)
  }

  render () {
    const { ...props } = this.props

    props.disabled = this.state.disabled || props.disabled

    return (
      <Button {...props} 
          bsStyle="primary"
          className="google-login app-accountsUI btn-margin"
          onClick={() => user.googleLogin() }>
            Login
      </Button>
    )
  }
}

export const refresh = function(setIdToken) {
  // Can't refresh until apis.google.com has finished loading
  let _gapi = (typeof gapi !== 'undefined' && gapi) || null
  let auth2 = (_gapi && _gapi.auth2 && _gapi.auth2.getAuthInstance()) || null
  if (!auth2) {
    setIdToken(null)
    return
  }

  let googleUser = auth2.currentUser.get()
  if (googleUser) {
    googleUser.reloadAuthResponse()
      .then(authResponse => {
        setIdToken(authResponse.id_token)
      })
      .catch(err => {
        // Not able to reload, cause the user to login again
        setIdToken(null)
      })
    return
  }

  setIdToken(null)
}

