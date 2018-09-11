// Verify the OpenID bearer id_token in the header.
// Fail request if not found or invalid.
// Add req.email for verified user.
// Currently this code assumes we are getting our id_token from Google

// const { log } = require('./log.js')

const { OAuth2Client } = require('google-auth-library')

const googleClientId = "6286565436-21s5kkroam6583qtdjfoh82prcf0klbn.apps.googleusercontent.com"

const client = new OAuth2Client(googleClientId);

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
        console.log('!!!', error)
        res.status(401).send(error)
        return
    }

    let parts = auth.split(' ')
    if (parts.length < 2 || parts[0].toLowerCase() !== 'bearer') {
        let error = 'No bearer token!'
        console.log('!!!', error, auth)
        res.status(401).send(error)
        return
    }

    let idToken = parts[1]

    verify(idToken)
        .then(email => {
            if (!email) {
                sendError(res, 404, 'No email address!')
                return
            }

            req.email = email

            // Ensure that client CORS processing knows that Authorization headers are allowed
            res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization")

            next()
       })
       .catch(err => {
            console.log('!!!', err)
            res.status(401).send(err)
       })
}
