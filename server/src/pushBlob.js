// Accept a blob which is being pushed to server and write it to local fs.
// The blob is (typically) a segment of video file that is being temporarily stored
// so that when all parts are accepted, the combined file can be pushed to S3.

const fs =require('fs')
const { log } = require('./log.js')

// Produce path name in local file system based on url being pushed.
// We flatten this to avoid needing to create deeply nested directories
// to hold the temporary files.
function localPath(url) {
    let baseDir = process.env.VIDEOSDIR || '/Users/nmiles/source/server/videos'
    if (!baseDir.endsWith('/')) baseDir += '/'

    // When we write files locally on the server we changes /'s to &'s
    // in order to keep them all in the same directory ... they are only
    // on the server temporarily before being copyed to S3.
    let result = url.substring(1)
    result = result.replace(/\//g, '=')  // flatten path
    result = result.replace('%20', ' ')  // remove unsightly url encoding
    result = baseDir + result
    return result
}

exports.localPath = localPath

//!! is there some way we can detect failure of transfer and delete temporary files?

const pushBlob = function(req, res) {
    //log.info("pushBlob", req.url)

    let ct = req.headers['content-type']
    if (!ct) {
        log.error("no content type", req.headers)
        res.writeHead(400)
        res.end()
        return
    }

    if (!ct.startsWith('video/webm') && !ct.startsWith('video/mp4') && !ct.startsWith('text/plain')) {
        log.error(`_push_ bad content type: ${ct}`)
        res.writeHead(400)
        res.end()
        return
    }
    
    let chunks = []

    const done = function(err, buffer) {
        let path = localPath(req.url)

        try {
            //! ought to be async file write
            log.debug(`_push_ done path=${path} [${buffer.byteLength} bytes]` )
            fs.writeFileSync(path, buffer)

            res.writeHead(200)
            res.end()
        }
        catch (err) {
            log.error(`_push_ path=${path}, err=${err}`)
            res.writeHead(500)
            res.end()
        }
    }    
    
    req.on('readable', () => { 
        let data = req.read()
        if (!data) return 
        chunks.push(data) 
    })
    
    req.on('end', () => { 
        let buffer = Buffer.concat(chunks)
        done(null, buffer) 
    })
}


exports.pushBlob = function(req, res) {
    if (req.method === 'PUT') {
        pushBlob(req, res)
        return
    }

    log.error("Invalid /push method", req.method)
    res.writeHead(400)
    res.end()
}

