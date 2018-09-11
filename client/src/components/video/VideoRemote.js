import { extendObservable } from 'mobx'
import  { EventEmitter } from 'fbemitter'
import _ from 'underscore'

import { checkStatus, pushBlob, concatBlobs } from '../../models/API.js'


/*
    Events emitted:
        recording_done(signedUrl, duration)
        record
        stop
        play
 */

/*
    let remote = new VideoRemote()
    let subscription = remove.addListener('play', listener)
    ...
    this.emit('play')
    ...
    subscription.remove()
 */

//!! retry on failure to upload recording

class VideoRemote extends EventEmitter {
    constructor () {
        super()

        extendObservable(this, {
            status: '',
                // VideoPlayer
                //     playing_loading
                //     playing_loaded

                // VideoRecorder
                //     recording_requested
                //     recording_initializing
                //     recording
                //     recording_uploading
                //     recording_done

                // Combined statuses
                //     error (message set)
                
            playing: false,

            playbackRate: 1.0,   // 1.0 = standard speed

            created: 0, // Date.now() when video recording initiated
            currentTime: 0.0, // seconds from start of video
            duration: 0.0, // seconds

            recordingPath: null,
            project: '',
            signedUrl: null,
        })
    }

    // Stop play or record action
    stop() {
        this.emit('stop')
    }

    setStatus(status, message) {
        console.log('...', status, message || '')
        this.status = status
        if (message) {
            console.log('ERROR', message)
            this.message = message
        }
    }

    // ================= Recording related functions =================

    record(project, recordingPath) {
        if (!project) throw new Error('No recording project')
        if (!recordingPath) throw new Error('No recording path')

        this.project = project
        this.recordingPath = recordingPath
    }

    initializeRecording() {
        this.created = new Date()

        this.duration = 0.0
        this.url = null

        this.blobs = []
        this.blobsSent = 0
        this.sendingBlob = false
    }

    finalizeRecording() {
        //console.log('!!!finalizeRecording')
        this.duration = (Date.now() - this.created) / 1000.0
        this.setStatus('recording_uploading')
    }

    _checkForBlobsToSend() {
        let self = this

        return new Promise((resolve, reject) => {
            let { project, recordingPath, blobs, blobsSent, sendingBlob } = self
            //console.log('!!!_checkForBlobsToSend', recordingPath, blobs.length, blobsSent, sendingBlob)
            
            if (sendingBlob || blobsSent >= blobs.length) {
                //console.log('!!!send in progress OR nothing to send', )
                resolve()
                return
            }
            
            this.sendingBlob = true
            pushBlob(project, recordingPath, blobsSent + 1, blobs[blobsSent])
                .then(checkStatus)
                .then(() => { 
                    //console.log('success sending blob', )
                    self.sendingBlob = false
                    self.blobsSent = self.blobsSent + 1 
                })
                .then(self._checkForBlobsToSend.bind(self))
                .then(self._checkForUploadingEnded.bind(self))
                .catch(err => { 
                    self.setStatus('error', 'pushBlob[1]: ' + JSON.stringify(err)) 
                })
        })
    }

    _checkForUploadingEnded() {
        let self = this

        return new Promise((resolve, reject) => {
            let { project, recordingPath, blobs, status } = self
            //console.log('!!!_checkForUploadingEnded', recordingPath, blobs.length, status)

            if (status !== 'recording_uploading') {
                resolve()
                return
            }

            concatBlobs(project, recordingPath, blobs.length)
                .then(checkStatus)
                .then(response => response.text())
                .then(url => {
                    self.recordingPath = null
                    self.url = url
                    self.emit('recording_done', url, this.duration)
                })
                .catch(err => { 
                    self.setStatus('error', 'concatBlobs: ' + JSON.stringify(err)) 
                })

        })
    }

    push(blob) { 
        let { blobs, blobsSent } = this
        //console.log('!!!PUSH', blobEvent.data && blobEvent.data.size, blobs.length, blobsSent)

        blobs.push(blob)
        if (blobs.length > blobsSent+1) return

        this._checkForBlobsToSend()
            .then( this._checkForUploadingEnded.bind(this) )
            .catch(err => { 
                this.setStatus('error', 'push[2]: ' + JSON.stringify(err)) 
            })
    }

    // ================= Playing related functions =================

    // If passage is not null and has a recorded video load it.
    // Otherwise undisplay currently displayed passage if any.
    loadPassage(passage, passageVideo) {
        if (!passageVideo) {
            passageVideo = _.last(passage && passage.videosNotDeleted)
        }
        this.duration = (passageVideo && passageVideo.duration) || 0.1
        this.playing = false

        if (passageVideo) {
            passageVideo.getSignedUrl(err => {
                if (err) {
                    this.setStatus('error', 'loadPassage: ' + JSON.stringify(err)) 
                    return
                }

                this.signedUrl = passageVideo.signedUrl
            })
        }
    }

    // startTime = null, means play from current position
    // endTime = null, means play through until end
    // rate = null, means 1.0
    // VideoMain is the primary listener for this event.
    play(startTime, endTime, rate) {
        this.emit('play', startTime, endTime, rate)
    }

    playSignedUrl(signedUrl) {
        this.signedUrl = signedUrl
    }

    setCurrentTime(currentTime) {
        //!! error if not in range 0..duration
        this.currentTime = currentTime
        this.emit('setCurrentTime')
    }

    togglePlayRecord() {
        if (this.playing || this.recordingPath) this.stop()
        if (this.signedUrl && !this.playing) this.play()
    }

}

export default VideoRemote
