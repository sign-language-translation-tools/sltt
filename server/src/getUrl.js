// Copy the uploaded video parts to S3.
// Return a pre-signed url to play this video.

const fs =require('fs')
const _ = require('underscore')
const { log } = require('./log.js')
const { awsS3 } = require('./awsS3.js')
const { createPresignedS3URL } = require('aws-signature-v4')

let expires = 24*3600 // 24 hours, this is the max that AWS will allow given
   // through this request mechanism
// expires = 35  // !!! TESTING

function getSignedUrl(path) {
    let signedUrl = createPresignedS3URL(path, {
        bucket: process.env.SLTT_BUCKET,
        key: process.env.SLTT_UPLOADER_ACCESS_KEY,
        secret: process.env.SLTT_UPLOADER_SECRET_ACCESS_KEY,
        region: 'us-east-1',
        method: 'GET',
        expires
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
