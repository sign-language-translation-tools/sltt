import { extendObservable, autorun } from 'mobx'
import debug from 'debug'

import { userProjects } from '../app/UserProjects.js'
import { displayError } from '../utils/Errors.jsx'

const log = debug('sltt:User') 

// Provide the current name and OpenID id_token for the user.
// At the moment this functionality is tightly entangled with the Google login.
// Eventually we would like to support Google and Octopus (and Facebook?) login with the
// platform specific functionality clearly separated.

/* global gapi */

/* id_token payload example

    azp: "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com",
    aud: "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com", 
                // Requesting app, server must verify when validating
    sub: "113097956304962157084",   
                // Unique user Id
    email: "milesnlwork@gmail.com",
    email_verified: true,
    at_hash: "l06jRjlxTPvHne6wMk3Mrg",
    exp: 1537042110,
    iss: "accounts.google.com",
                // Authentication service, server must verify
    jti: "1be6245a4cab6e5ae76d0e7172eb0489d106b9fc",
    iat: 1537038510
*/

class User {
    constructor() {
        // We make these mobx observable so that when they change the components
        // that use them will automatically re-render.
        extendObservable(this, {
            // This the jwt that identifies the current user.
            // When this is set, the application is in the logged in state.
            id_token: '',

            // User name for current user. Currently we use their email address
            username: '',

            // True when user is allowed to see the database debugging tool.
            allowDatabase: false,
        })

        autorun(() => {
            this.reactToTokenIdChange()  // run this whenever id_token changes
        })
    }

    reactToTokenIdChange() {
        let { id_token } = this

        if (!id_token) {
            log(`eactToTokenIdChange id_token=null`)
            userProjects.clear()
            return
        }

        log(`reactToTokenIdChange id_token=${id_token && id_token.substring(0,15)}`)
        
        let payload = id_token.split('.')[1]
        let parsedPayload = JSON.parse(atob(payload))
        let username = parsedPayload.email

        //!!! make this be a configured role
        this.allowDatabase = username === 'milesnlwork@gmail.com'

        // When username is first available or there is a new username, initialize the projects
        // for this username.
        if (username !== this.username) {
            this.username = username

            userProjects.initialize(username, err => {
                if (err) {
                    displayError(err)
                    return
                }
                
                log(`userProjects.reactToTokenIdChange done`)
            })
        }
    }

    googleLogin() {
        log('googleLogin')
        let options = { prompt: 'select_account' }
        const auth2 = gapi.auth2.getAuthInstance()

        auth2.signIn(options).then(googleUser => {
            log('googleLogin done')
            let id_token = googleUser.getAuthResponse().id_token
            this.id_token = id_token
        })
    }

    logout() {
        log('logout')
        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signOut()

        this.id_token = ''
        this.username = ''

        userProjects.clear()
    }

    setupTestUser() {
        this.id_token = process.env.SLTT_USER_JWT
        this.username = 'milesnlwork@gmail.com'
    }
}

export const user = new User()
