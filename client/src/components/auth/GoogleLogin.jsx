// Provide a button to login by directly calling the Google apis

// Based on github.com/kennetpostigo/react-google-login-component
// Google api info: developers.google.com/identity/sign-in/web/reference
// https://developers.google.com/identity/sign-in/web/backend-auth
// https://stackoverflow.com/questions/32150845/how-to-refresh-expired-google-sign-in-logins

/*
make unit tests work (with new authentication)
Remove auth0 dependencies/code
*/

/* global gapi */

import React from 'react'
import { Button } from 'react-bootstrap'
import { user } from './User.js'
import debug from 'debug'

const log = debug('sltt:GoogleLogin') 

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
      log(`google API script loaded`)

      gapi.load('auth2', () => {
        log(`auth2 loaded`)

        this.setState({ disabled: false })

        if (!gapi.auth2.getAuthInstance()) {
          gapi.auth2.init({
            client_id: googleClientId,
            fetch_basic_profile: false,
            scope: 'profile'
          })
        }

        checkIdTokenNowAndOnWakeup(user)
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
          onClick={() => { log('googleLogin'); user.googleLogin() } }>
            Login
      </Button>
    )
  }
}

function expired(jwt) {
  try {
    let payload = jwt.split('.')[1]
    let decoded = JSON.parse(atob(payload))
    if (decoded.exp < (new Date()).getTime() - decoded.iat)
      return false
  } catch (error) {
  }

  log('jwt expired')
  return true    
}

// Get jwt Id Token.
// If current token expired, try to renew it.
// If cannot renew, resolve to null.

export const getGoogleIdToken = function(user) {
  return new Promise((resolve, reject) => {
    let _gapi = (typeof gapi !== 'undefined' && gapi) || null
    let auth2 = (_gapi && _gapi.auth2 && _gapi.auth2.getAuthInstance()) || null
    if (!auth2) {
      log('getGoogleIdToken - no AuthInstance!!!')
      user.id_token = null
      reject('no AuthInstance')
      return
    }

    let googleUser = auth2.currentUser.get()
    if (!googleUser) { 
      log('getGoogleIdToken - no googleUser!!!')
      user.id_token = null
      resolve(null)
      return 
    }

    let id_token = googleUser.getAuthResponse().id_token
    if (id_token && !expired(id_token)) {
      log('getGoogleIdToken - ok')
      if (user.id_token !== id_token)
        user.id_token = id_token
      resolve(id_token)
      return
    }

    googleUser.reloadAuthResponse()
      .then(authResponse => {
        log('getGoogleIdToken - reloaded')
        user.id_token = authResponse.id_token
        resolve(authResponse.id_token)
      })
      .catch(err => {
        // Not able to reload, no id_token available
        log('getGoogleIdToken - reload failed!!!', err)
        user.id_token = null
        resolve(null)
      })
  })
}

// Make sure we are in logged out state (user.id_token = null) now and when the
// computer wakes up.
// If the id_token cannot be refreshed to be valid, clear it to put the app
// in the logged out state ... user will then login to create a valid token.

export const checkIdTokenNowAndOnWakeup = function(user) {
  var TIMEOUT = 2000;
  var lastTime = 0 // force check to happen now

  setInterval(function () {
    var currentTime = (new Date()).getTime()
    if (currentTime > (lastTime + TIMEOUT + 4000)) {
      // There has been a gap in the execution times for this function.
      // Mostly likely because this page is waking up after the computer has been sleeping.

      // We fetch the IdToken here for the side effect of clearing it
      // if this token can no longer be refreshed to a valid state.
      log('checkIdTokenNowAndOnWakeup triggered')
      getGoogleIdToken(user)
        .then(() => { })
        .catch(() => { })
    }

    lastTime = currentTime
  }, TIMEOUT)
}
