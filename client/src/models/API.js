// Library to perform non-PouchDB functions on the server
//     pushBlob - push a blob from a video being recorded in the browser
//     pushFile - push a file from the local machine to the server
//     concatBlobs - concatenate the pushed blobs, push this to S3
//     getUrl - get a signed url to access a S3 video

import fetch from 'node-fetch'

import { user } from '../components/auth/User.js'
import { getGoogleIdToken } from '../components/auth/GoogleLogin.jsx'

const log = require('debug')('sltt:API') 

export function getHostUrl() {
    let hostUrl = 'https://sl.paratext.org:4000'

    if (process.env.NODE_ENV === 'localserver') {
        hostUrl = 'http://localhost:3001'
        log(`hostUrl=LOCALHOST:3001`)
    }

    return hostUrl
}

export function authorization() {
    if (!user.id_token) throw new Error('Authorization not set')
    return 'Bearer ' + user.id_token
}

// Thow an error if response status is not 200
export function checkStatus(response) {
    if (response.status === 200) {
        return Promise.resolve(response)
    } else {
      log(`checkStatus ERROR status=${response.status}, statusText=${response.statusText}`)
      return Promise.reject(new Error(response.statusText))
    }
}

export function getText(response) {
    return response.text()
}

export function getJson(response) {
    return response.json()
}

export function refreshIdToken() {
    return getGoogleIdToken()
}

// Called every time the video element has a new block to upload.
export async function pushBlob(projectName, path, seqNum, blob) {
    let _pushBlob = new Promise((resolve, reject) => {
        if (!user.id_token) { reject('Not logged in.'); return }

        let path2 = `${getHostUrl()}/${projectName}/_push_/${path}=${seqNum}`

        let xhr = new XMLHttpRequest()
        xhr.open('PUT', path2, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status !== 200) {
                log(`*** pushBlob reject status=${xhr.status}`)
                reject({ status: xhr.status })
                return
            }

            log(`pushBlob resolve`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }

        xhr.onerror = (err) => {
            log(`*** pushBlob onerror ${err}`)            
            reject(err)
        }

        // Initiate the upload of this video segment
        log('pushBlob xhr.send')
        xhr.send(blob)
    })

    await getGoogleIdToken()
    await _pushBlob
}

export async function pushFile(file, projectName, path, onprogress) {
    let _pushFile = new Promise((resolve, reject) => {
        let url = `${getHostUrl()}/${projectName}/_push_/${path}=1`
        log(`pushFile start ${url}`)
        
        var xhr = new XMLHttpRequest()
        
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)
        
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return
            
            if (xhr.status !== 200) {
                log(`pushFile reject status=${xhr.status}`)
                reject({ status: xhr.status })
                return
            }
            
            log(`pushFile resolve`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }
        
        xhr.onerror = (err) => {
            log(`*** pushFile onerror ${err}`)            
            reject(err)
        }
        
        xhr.upload.onprogress = onprogress
        
        xhr.send(file)
    })
    
    await getGoogleIdToken()
    await _pushFile
}

// After the the individual blobls have been pushed to server,
// concatenate them and push them to S3.
// Return the URL of the resulting video file S3 object.

export async function concatBlobs(projectName, path, seqNum) {
    await getGoogleIdToken()

    let path2 = `${getHostUrl()}/${projectName}/_concat_/${path}=${seqNum}`
    log(`concatBlobs start ${path2}`)
    
    let options = {
        method: 'GET',
        headers: {Authorization: 'bearer ' + user.id_token},
    }
    let response = await fetch(path2, options)
    checkStatus(response)
    
    let url = await response.text()
    log(`concatBlobs success`)
    return url
}

// Upload the file and return its url
export async function uploadFile(file, projectName, path, onprogress) {
    await pushFile(file, projectName, path, onprogress)
    let url = await concatBlobs(projectName, path, 1)
    return url
}

// Pass a url for an S3 video file object to server.
// Get back a singed url that allows downloading the object.
// This url will expire in 6 days.

export async function getUrl(projectName, url) {
    log(`getUrl start ${url}`)
    
    await getGoogleIdToken()

    let path = `${getHostUrl()}/${projectName}/_url_?url=${encodeURIComponent(url)}`

    let options = {
        method: 'GET',
        headers: { Authorization: 'bearer ' + user.id_token },
    }
    let response = await fetch(path, options)
    checkStatus(response)

    let signedUrl = await response.text()
    log(`getUrl success ${signedUrl.slice(0,80)}`)
    return signedUrl
}
