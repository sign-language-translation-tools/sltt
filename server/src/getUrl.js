// Copy the uploaded video parts to S3.
// Return a pre-signed url to play this video.

const fs =require('fs')
const _ = require('underscore')
const { log } = require('./log.js')
const { awsS3 } = require('./awsS3.js')
const { createPresignedS3URL } = require('aws-signature-v4')

function getSignedUrl(path) {
    let signedUrl = createPresignedS3URL(path, {
        bucket: 'ubs-signlanguage-upload',
        key: process.env.signlanguage_uploader_access_key,
        secret: process.env.signlanguage_uploader_secret_access_key,
        region: 'us-east-1',
        method: 'GET',
        expires: 6*24*60,
    })

    //console.log('getUrl', signedUrl)
    return signedUrl
}

function getUrl(req, res) {
    let { url } = req
    let parts = url.split('=')
    let signedUrl

    try {
        signedUrl = getSignedUrl(decodeURIComponent(parts[1]))
    }
    catch (err) {
        log.error(`_url_ getSignedUrl error url=${url}, err=${err}`)
        res.writeHead(500)
        res.end()
        return
    }

    log.info(`_url_ DONE url=${url}, signedUrl=${signedUrl.substring(0,30)}...`)

    res.send(signedUrl)
}

exports.getUrl = function (req, res) {
    if (req.method === 'GET') {
        getUrl(req, res)
        return
    }

    log.error(`_url_ Invalid method: ${req.method}`)
    res.writeHead(400)
    res.end()
}
