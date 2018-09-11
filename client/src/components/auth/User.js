import { extendObservable } from 'mobx'
import { userProjects } from '../app/UserProjects.js'
import { refresh } from './GoogleLogin.jsx'
import { displayError } from '../utils/Errors.jsx'

// Provide the current name and OpenID id_token for the user.
// At the moment this functionality is tightly entangled with the Google login.
// Eventually we would like to support Google and Facebook login with the
// platform specific functionality clearly separated.

/* global gapi */

/* id_token payload example

    azp: "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com",
    aud: "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com", 
                // Requesting app, must verify when validating
    sub: "113097956304962157084",   
                // Unique user Id
    email: "milesnlwork@gmail.com",
    email_verified: true,
    at_hash: "l06jRjlxTPvHne6wMk3Mrg",
    exp: 1537042110,
    iss: "accounts.google.com",
                // Authentication service, must verify
    jti: "1be6245a4cab6e5ae76d0e7172eb0489d106b9fc",
    iat: 1537038510
*/

class User {
    constructor() {
        // We make these mobx observable so that when they change the components
        // that use them will automatically re-render.
        extendObservable(this, {
            username: '',
            id_token: '',
            allowDatabase: false,
        })

        // The id_token expires in 1 hour, so refresh it every 50 minutes
        setInterval(refresh(this.setIdToken.bind(this)), 50*60000)
    }

    clear() {
        this.setIdToken(null)
        userProjects.clear()
    }

    setIdToken(id_token) {
        console.log(`setIdToken id_token=${id_token && id_token.substring(0,15)}`)
        
        this.id_token = id_token
        if (!id_token) {
            this.username = ''
            return
        }

        let payload = id_token.split('.')[1]
        let parsedPayload = JSON.parse(atob(payload))
        
        let username = parsedPayload.email
        this.username = username

        this.allowDatabase = username === 'milesnlwork@gmail.com'

        userProjects.initialize(username, err => {
            if (err) {
                displayError(err)
                return
            }

            console.log(`User#userProjects.initialize done`)
        })

        console.log(`setIdToken username=${username}`)
    }

    googleLogin() {
        let options = { prompt: 'select_account' }
        const auth2 = gapi.auth2.getAuthInstance()

        auth2.signIn(options).then(googleUser => {
            let id_token = googleUser.getAuthResponse().id_token
            this.setIdToken(id_token)
        })
    }

    logout() {
        const auth2 = gapi.auth2.getAuthInstance()
        auth2.signOut()

        this.clear()
    }

// localStorage.setItem('access_token', authResult.accessToken)
// localStorage.removeItem('access_token')

    idToken() {
        return this.id_token
    }

    setupTestUser() {
        this.id_token = process.env.SLTT_USER_JWT
        this.username = 'milesnlwork@gmail.com'
    }
}

export const user = new User()
