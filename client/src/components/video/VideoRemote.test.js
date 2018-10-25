import fetch from 'node-fetch'

import VideoRemote from './VideoRemote.js' 
import { checkStatus, getText, getUrl } from '../../models/API.js'
import { user } from '../auth/User.js'

// clean up test files in S3

it('can push blobs to s3', (done) => {
    let remote = new VideoRemote() 

    let line1 = Date.now().toString() + '\r\n'
    let line2 = 'line 2\r\n'

    remote.addListener('recording_done', (err, url) => {
        // Verify that we can retrieve the uloaded S3 file

        if (err) throw Error(err)

        getUrl('_test1', url)
            .then(checkStatus)
            .then(getText)
            .then(signedUrl => {
                return fetch(signedUrl)
            })
            .then(checkStatus)
            .then(getText)
            .then(text => {
                expect(text).toBe(line1 + line2)
                done()
            })
            .catch(err => {
                console.log('fetch error', err)
            })
    })

    user.id_token = process.env.SLTT_USER_JWT

    remote.project = '_test1'
    remote.path = 'test 1.txt'
    remote.initializeRecording.bind(remote)()

    let blob = new Blob([line1], { type: 'text/plain' })
    remote.push(blob)

    let final = function () { 
        remote.finalizeRecording.bind(remote)()
        // Simulate the last blob we think we will get from video after recording is stopped
        let blob2 = new Blob([line2], {type: 'text/plain'})
        remote.push(blob2)
    }
    setTimeout(final, 1000)
})
