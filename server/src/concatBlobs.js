// Concatenate the uploaded blobs into a single video file.
// Copy the video to S3.
// Return a URL to this uploaded video.
// The returned URL will have to be signed with access information later.
// We cannot sign it now because S3 forces signed URLs to expire in 1 week.

const fs =require('fs')
const _ = require('underscore')
const { log } = require('./log.js')
const { awsS3 } = require('./awsS3.js')
const { createPresignedS3URL } = require('aws-signature-v4')

const { localPath } = require('./pushBlob.js')


// Produce path (key) in S3 bucket from url
function remotePath(url) {
    let result = url.substring(1)
    result = result.replace(/%20/g, '_')
    result = result.replace(/ /g, '_')
    return result
}

// Files are uploaded to server as a series of smaller pieces.
// Given an array of input file paths, concat all into a single outPath.
// Delete all the inPath files.
function concatPaths(outPath, inPaths, ind, resolve, reject) {
    if (ind >= inPaths.length) {
        resolve();
        return
    }

    let path = inPaths[ind]

    fs.readFile(path, (err, data) => {
        if (err) { reject(err); return }

        fs.unlink(path, err => {
            if (err) { reject(err); return }

            fs.appendFile(outPath, data, (err => {
                if (err) { reject(err); return }
                concatPaths(outPath, inPaths, ind + 1, resolve, reject)
            }))
        })
    })
}

function copyToS3(req, res, url) {
    let Key = remotePath(url)

    let params = {
        Body: fs.createReadStream(localPath(url)),
        Key,
        Bucket: process.env.SLTT_BUCKET,
    }

    awsS3.putObject(params, (err) => {
        if (err) {
            log.error(`_concat_ copyToS3 error, url=${url}, err=${err}`)
            res.writeHead(500)
            res.end()
            return
        }

        log.info(`_concat_ copyToS3 DONE`)

        fs.unlink(localPath(url), err => {
            //! log error, but failure to delete file should cause operation to fail
            res.send(Key)
        })
    })
}

function concatBlobs(req, res) {
    let { url } = req
    let parts = url.split('=')
    let outPath = localPath(parts[0])
    let count = parseInt(parts[1])

    let inPaths = _.range(0, count).map(i => outPath + '=' + (i+1))

    let resolve = () => {
        copyToS3(req, res, parts[0])
    }

    let reject = (err) => {
        log.error(`_concat_ error url=${url}, outPath=${outPath}, err=${err}`)
        res.writeHead(500)
        res.end()
    }

    concatPaths(outPath, inPaths, 0, resolve, reject)
}

exports.concatBlobs = function (req, res) {
    if (req.method === 'GET') {
        concatBlobs(req, res)
        return
    }

    log.error("Invalid /url method", req.method)
    res.writeHead(400)
    res.end()
}
