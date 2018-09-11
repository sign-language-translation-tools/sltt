import fetch from 'node-fetch'

import { user } from '../components/auth/User.js'

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
    //console.log(`checkStatus ${response.status}`)

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

// Called every time the video element has a new block to upload.
export function pushBlob(projectName, path, seqNum, blob) {
    if (!user.id_token) throw new Error('pushBlob - No user.id_token')

    return new Promise((resolve, reject) => {
        let path2 = `${hostUrl}/${projectName}/_push_/${path}=${seqNum}`

        let xhr = new XMLHttpRequest()
        xhr.open('PUT', path2, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status !== 200) {
                reject({ status: xhr.status })
                return
            }

            console.log(`_push_ reject status=${xhr.status}`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }

        xhr.onerror = (err) => {
            console.log('!!! pushBlob onerror')            
            reject(err)
        }

        // Initiate the upload of this video segment
        console.log('!!! pushBlob xhr.send')
        xhr.send(blob)
    })
}

export function pushFile(file, projectName, path, onprogress) {
    if (!user.id_token) throw new Error('pushFile - No user.id_token')
    
    return new Promise((resolve, reject) => {
        let url = `${hostUrl}/${projectName}/_push_/${path}=1`
        console.log(`_push_(pushFile) start ${url}`)

        var xhr = new XMLHttpRequest()
    
        xhr.open('PUT', url, true)
        xhr.setRequestHeader('Authorization', 'bearer ' + user.id_token)
    
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return

            if (xhr.status !== 200) {
                console.log(`_push_(pushFile) reject status=${xhr.status}`)
                reject({ status: xhr.status })
                return
            }

            console.log(`_push_(pushFile) resolve`)
            resolve({ status: xhr.status } /* mimic fetch 'response' */)
        }

        xhr.onerror = (err) => {
            reject(err)
        }

        xhr.upload.onprogress = onprogress
    
        xhr.send(file)
    })
}

// After the the individual blobls have been pushed to server,
// concatenate them and push them to S3.
// Return the URL of the resulting video file S3 object.

export function concatBlobs(projectName, path, seqNum) {
    if (!user.id_token) throw new Error('No user.id_token')

    let path2 = `${hostUrl}/${projectName}/_concat_/${path}=${seqNum}`
    console.log(`_concat_ start ${path2}`)

    let options = {
        method: 'GET',
        headers: {Authorization: 'bearer ' + user.id_token},
    }

    return fetch(path2, options)
}

// Pass a url for an S3 video file object to server.
// Get back a singed url that allows downloading the object.
// This url will expire in 6 days.

export function getUrl(projectName, url) {
    if (!user.id_token) throw new Error('No user.id_token')

    let path2 = `${hostUrl}/${projectName}/_url_?url=${encodeURIComponent(url)}`

    let options = {
        method: 'GET',
        headers: { Authorization: 'bearer ' + user.id_token },
    }

    return fetch(path2, options)
}
