// Verify the bearer token in the header, fail if not found or invalid
// Add req.email for verified user.

const fs =require('fs')
const _ = require('underscore')
const { log } = require('./log.js')
var jwt = require('jsonwebtoken')

// AFAICT Auth0 forces us to use RS256 public key validation for idToken's (even tho
// there is a setting that allows you to pick HS256).
// If it has changed (not sure what would cause that) retrieve the public key value here: 
//     https://sltt.auth0.com/.well-known/jwks.json

// public key
const x5c = "MIIC9zCCAd+gAwIBAgIJJ72CAxkgI9qjMA0GCSqGSIb3DQEBCwUAMBkxFzAVBgNVBAMTDnNsdHQuYXV0aDAuY29tMB4XDTE4MDMwNzIyMDM1N1oXDTMxMTExNDIyMDM1N1owGTEXMBUGA1UEAxMOc2x0dC5hdXRoMC5jb20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCoCGkikXtFaL6BvPnKuCNZswCJbSm1iEw46PBuCpoGtN1hKZPv1FXQHbe6iiKO/6zXCDGQZW8j+yAS6bOs96Es8zepMpRFAuoAhLOTkW5X3duCnO4mbMfWFvXT/oxIOHTM+mFarbp0d03MtR+50b71VOISQks4b3QzCqDqTvhj9ExuYMwt5Gh+EXeORuSSp+oWv1tl9ASJi7eA+clVvRKf5CJVtHA7QQwqPWoIVQPmrzyVrS4zAiLFYx9I6N9IEGJ7DBXlzuhU3oWkcagwgcFm2GLOE7Tw3qQuzIUjowlqePxNhDvcnxoJ2Laqp69XAijBRz2j22yOj01MLgVQpEOnAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFFK45v7fwp+RjdUOzmtTrAYyg0zIMA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEAoJK1iOab5VVmipGtM1VMKSVSR9y8x2CCdgLYcbWUvsMyHp4RBJIT8S8R/pyZ+IjAJsAiu5zKBxMRxli4Vd1L0RQtY1J8PWoNScdf9JgumYEq0TLQJpN8AByRIauXmKkfoqNLLSp0kkae35q6jiG/knLtypGggsYmCm5rn8nWjMZxFgpLrMbW6p6vaHS2nh0UR7AO/ASBLk7mTxyKprbhCkoSQv4wlDu9D0DZQsNc66JBLHdN1VhE+LaSGr8CyefXdSvl4LWppjehwLI6YpZoKQ28siyjwbYUE9sK65FzOa2c43U5qCPVkNu4Zz09k442JdTKp18M9BnYlw+5+ZxkMg=="

function certToPEM(cert) {
    cert = cert.match(/.{1,64}/g).join('\n');
    cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
    return cert;
}


exports.checkAuthentication = function (req, res, next) {
    let publicKey = certToPEM(x5c)

    // console.log(`METHOD=${req.method}`)
    
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

    jwt.verify(idToken, publicKey, {algorithms: ['RS256']}, (err, decoded) => {
        if (err) {
            console.log('!!!', err)
            res.status(401).send(err)
            return
        }

        if (!decoded.email) {
            sendError(res, 404, 'No email address!')
            return
        }

        req.email = decoded.email

        // Ensure that client CORS processing knows that Authorization headers are allowed
        res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization")
        
        next()
    })

}
