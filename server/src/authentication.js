// Verify the OpenID bearer id_token in the header.
// Fail request (401/404) if not found or invalid.
// Add req.email for verified user.
// Set req.isRoot if root (admin for all projects) user.
// Currently this code assumes we are getting our id_token from Google

const log = require('debug')('sltt:authentication')
const debug = require('debug')('slttdebug:authentication')

const { OAuth2Client } = require('google-auth-library')

const googleClientId = "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com"

const client = new OAuth2Client(googleClientId);

// Verify that the idToken is has valid content and signature.
// Return email address for this user [or throw an exception]
async function verify(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,  
    })
    const payload = ticket.getPayload()
    return payload['email']
}

exports.checkAuthentication = function (req, res, next) {    
    let auth = req.headers && req.headers.authorization

    if (!auth) {
        let error = 'No authorization header!'
        log(error)
        res.status(401).send(error)
        return
    }

    let parts = auth.split(' ')
    if (parts.length < 2 || parts[0].toLowerCase() !== 'bearer') {
        let error = 'No bearer token!'
        log(`${error} ${auth}`)
        res.status(401).send(error)
        return
    }

    // Ensure that client CORS processing knows that Authorization headers are allowed
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization")

    let idToken = parts[1]

    // Check for the forever valid unit test idToken
    if (idToken && idToken === process.env.SLTT_USER_JWT) {
        debug(`SLTT_USER_JWT authenticated`)
        req.email = process.env.SLTT_USER
        req.isUnittest = true
        next()
        return
    }

    verify(idToken)
        .then(email => {
            if (!email) {
                log(`verify ERROR, No email address`)
                sendError(res, 404, 'No email address!')
                return
            }

            req.email = email

            let rootUsers = process.env.SLTT_ROOT_USERS
            req.isRoot = rootUsers && rootUsers.split(' ').includes(email)

            debug(`verify email=${email}, isRoot=${req.isRoot}`)

            next()
       })
       .catch(err => {
            log(`verify ERROR ${err}`)
            res.status(401).send(err)
       })
}
