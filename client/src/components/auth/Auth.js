import auth0 from 'auth0-js'
import { extendObservable } from 'mobx'

let callbackUrl
if (process.env.NODE_ENV === 'development') {
    callbackUrl = `http://localhost:3000/callback`
}
else {
    callbackUrl = `https://sl.paratext.org/callback`    
}

const AUTH_CONFIG = {
    domain: 'sltt.auth0.com',
    clientId: 'HwwlBwfX7p71D7DnKby4OqjMg7Elywjd',
    callbackUrl
}

export default class Auth {
    constructor() {
        this.auth0 = new auth0.WebAuth({
            domain: AUTH_CONFIG.domain,
            clientID: AUTH_CONFIG.clientId,
            redirectUri: AUTH_CONFIG.callbackUrl,
            audience: `https://${AUTH_CONFIG.domain}/userinfo`,
            responseType: 'token id_token',
            scope: 'openid email profile'
        })

        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
        this.handleAuthentication = this.handleAuthentication.bind(this)
        this.idToken = this.idToken.bind(this)

        extendObservable(this, {
            username: '',
            token: '',
        })
    }

    login() {
        console.log(`login`)
        this.auth0.authorize()
    }

    handleAuthentication({ location }, cb) {
        // If we already have an idToken we must not call parseHash again.
        // If we do we get an invalid state error since current state is erased
        // after it is used once.
        if (this.idToken()) {
            cb()
            return
        }

        console.log(`handleAuthentication location=${location.hash}`)
        if (!/access_token|id_token|error/.test(location.hash)) return
        
        //debugger
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                this.setSession(authResult)
                this.token = localStorage.getItem('id_token')
                this.username = localStorage.getItem('username')
                cb()
            } else if (err) {
                cb(err)
            }
        })
    }

    setSession(authResult) {
        // Set the time that the access token will expire at
        console.log(`setSession idToken=${authResult.idToken.substring(0,30)}; expiresIn=${authResult.expiresIn}`)

        let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime())
        
        localStorage.setItem('access_token', authResult.accessToken)
        localStorage.setItem('id_token', authResult.idToken)
        localStorage.setItem('expires_at', expiresAt)
        localStorage.setItem('username', authResult.idTokenPayload.email)
    }

    restoreSession() {
        user.token = this.idToken()
        user.username = localStorage.getItem('username')
    }

    logout() {
        // Clear access token and ID token from local storage
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        localStorage.removeItem('expires_at')
        localStorage.removeItem('username')

        user.token = ''
        user.username = ''
    }

    idToken() {
        // Check whether the current time is past the access token's expiry time
        let expiresAt = localStorage.getItem('expires_at')
        if (!expiresAt) return null

        expiresAt = JSON.parse(expiresAt)
        if (new Date().getTime() < expiresAt)
            return localStorage.getItem('id_token')

        return null
    }

    setupTestUser() {
        this.token = process.env.SLTT_USER_JWT
        this.username = 'milesnlwork@gmail.com'
    }
}

export const user = new Auth()
