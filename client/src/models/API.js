import fetch from 'node-fetch'

import { user } from '../components/auth/User.js'
import { getGoogleIdToken } from '../components/auth/GoogleLogin.jsx'

const debug = require('debug')('sltt:API') 


let _hostUrl
if (process.env.NODE_ENV === 'development') {
    _hostUrl = `https://sl.paratext.org:4000`
}
else {
    _hostUrl = `https://sl.paratext.org:4000`
}

// UNCOMMENT to access server on localhost
// _hostUrl = `http://localhost:3001`

export let hostUrl = _hostUrl


export function authorization() {
    if (!user.id_token) throw new Error('Authorization not set')
    return 'Bearer ' + user.id_token
}

export function checkStatus(response) {
    debug(`checkStatus ${response.status}`)

    if (response.status === 200) {
        return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
}

export function getText(response) {
    return response.text()
}

export function getJson(response) {
    return response.json()
}


// I could not make this work with 'fetch'
// function pushBlob(project, path, seqNum, blob) {
//     let path2 = `${hostUrl}/${project}/_push_/${path}=${seqNum}`
//     let options = {
//         method: 'PUT',
//         headers: {
//             "content-type": blob.type,
//             Authorization: 'bearer ' + user.id_token
//         },
//         body: blob,
//     }
//     return fetch(path2, options)
// }

function refreshIdToken(promise) {
    return getGoogleIdToken(user)
        .then(promise)
}

// Called every time the video element has a new block to upload.
export function pushBlob(projectName, path, seqNum, blob) {
    let _pushBlob = new Promise((resolve, reject) => {
        if (!user.id_token) { reject('Not logged in.'); return }

        let path2 = `${hostUrl}/${projectName}/_push_/${path}=${seqNum}`

        let xhr = new XMLHttpRequest()
        xhr.open('PUT', path2, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status !== 200) {
                debug(`*** pushBlob reject status=${xhr.status}`)
                reject({ status: xhr.status })
                return
            }

            debug(`pushBlob resolve`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }

        xhr.onerror = (err) => {
            debug(`*** pushBlob onerror ${err}`)            
            reject(err)
        }

        // Initiate the upload of this video segment
        debug('pushBlob xhr.send')
        xhr.send(blob)
    })

    return refreshIdToken(_pushBlob)
 }

export function pushFile(file, projectName, path, onprogress) {
    let _pushFile = new Promise((resolve, reject) => {
        if (!user.id_token) { reject('Not logged in.'); return }

        let url = `${hostUrl}/${projectName}/_push_/${path}=1`
        debug(`pushFile start ${url}`)

        var xhr = new XMLHttpRequest()
    
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)
    
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status !== 200) {
                debug(`pushFile reject status=${xhr.status}`)
                reject({ status: xhr.status })
                return
            }

            debug(`pushFile resolve`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }

        xhr.onerror = (err) => {
            debug(`*** pushFile onerror ${err}`)            
            reject(err)
        }

        xhr.upload.onprogress = onprogress
    
        xhr.send(file)
    })

    return refreshIdToken(_pushFile)
}

// After the the individual blobls have been pushed to server,
// concatenate them and push them to S3.
// Return the URL of the resulting video file S3 object.

export function concatBlobs(projectName, path, seqNum) {
    let _concatBlobs = new Promise((resolve, reject) => {
        if (!user.id_token) { reject('Not logged in.'); return }

        let path2 = `${hostUrl}/${projectName}/_concat_/${path}=${seqNum}`
        debug(`concatBlobs ${path2}`)
        
        let options = {
            method: 'GET',
            headers: {Authorization: 'bearer ' + user.id_token},
        }
        return fetch(path2, options)
    })

    return refreshIdToken(_concatBlobs)
}

// Pass a url for an S3 video file object to server.
// Get back a singed url that allows downloading the object.
// This url will expire in 6 days.

export function getUrl(projectName, url) {
    let _getUrl = new Promise((resolve, reject) => {
        if (!user.id_token) { reject('Not logged in.'); return}
        debug(`getUrl start ${url}`)

        let path2 = `${hostUrl}/${projectName}/_url_?url=${encodeURIComponent(url)}`

        let options = {
            method: 'GET',
            headers: { Authorization: 'bearer ' + user.id_token },
        }

        getGoogleIdToken(user)
            .then(() => fetch(path2, options))
            .then(checkStatus)
            .then(response => {
                return response.text()
            })
            .then(url => {
                debug(`getUrl resolve ${url}`)
                resolve(url)
            })
            .catch(err => {
                debug(`*** getUrl err: ${err}`)
                reject(err)
            })
    })

    return _getUrl
}
