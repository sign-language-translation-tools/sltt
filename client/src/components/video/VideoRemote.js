import { extendObservable } from 'mobx'
import  { EventEmitter } from 'fbemitter'
import _ from 'underscore'

import { pushBlob, concatBlobs } from '../../models/API.js'

const log = require('debug')('sltt:VideoRemote') 

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
        log('emit stop')
        this.emit('stop')
    }

    setStatus(status, message) {
        log(`setStatus ${status}`)
        message && log(`message ${message}`)

        this.status = status
        this.message = message
    }

    // ================= Recording related functions =================

    record(project, recordingPath) {
        log('record', project, recordingPath)

        if (!project) throw new Error('No recording project')
        if (!recordingPath) throw new Error('No recording path')

        this.project = project
        this.recordingPath = recordingPath
    }

    initializeRecording() {
        log('initializeRecording')

        this.created = new Date()

        this.duration = 0.0
        this.url = null

        this.blobs = []
        this.blobsSent = 0
        this.pushingBlob = false
        this.recording = true
    }

    finalizeRecording() {
        log('finalizeRecording')

        this.duration = (Date.now() - this.created) / 1000.0
        this.recording = false
    }

    // Recording and uploading complete.
    // Concatenate the uloaded blobs, copy them to S3, return the S# url
    async finishUpload() {
        log('finishUpload')
        let { project, recordingPath, blobs } = this

        try {
            this.url = await concatBlobs(project, recordingPath, blobs.length)
        } catch (error) {
            log('concatBlobs error', error)
            this.emit('recording_done', error)
            return
        }

        log(`finishUpload success ${this.url.slice(0,60)}`)

        this.recordingPath = null
        this.emit('recording_done', null, this.url, this.duration)
    }

    async push(blob) { 
        log(`pushBlob start`)
        let { project, recordingPath, blobs } = this

        blobs.push(blob)
        if (this.pushingBlob) return

        this.pushingBlob = true

        while (blobs.length > this.blobsSent) {
            log(`pushBlob ${this.blobsSent+1}`)
            await pushBlob(project, recordingPath, this.blobsSent + 1, blobs[this.blobsSent])
            log(`pushBlob ${this.blobsSent + 1}`)

            this.blobsSent = this.blobsSent + 1
        }

        this.pushingBlob = false

        if (!this.recording)
            await this.finishUpload()
    }

    // ================= Playing related functions =================
    // TODO switch this to async/await for clarity

    // If passage is not null and has a recorded video load it.
    // Otherwise undisplay currently displayed passage if any.
    loadPassage(passage, passageVideo) {
        log('loadPassage', passage && passage.name, passageVideo)

        if (!passageVideo) {
            passageVideo = _.last(passage && passage.videosNotDeleted)
        }
        this.duration = (passageVideo && passageVideo.duration) || 0.1
        this.playing = false
        this.signedUrl = null

        if (passageVideo) {
            passageVideo.getSignedUrl(err => {
                if (err) {
                    this.setStatus('error', 'loadPassage: ' + JSON.stringify(err)) 
                    return
                }

                log(`set signedUrl=${passageVideo.signedUrl}`)
                this.signedUrl = passageVideo.signedUrl
            })
        }
    }

    clearPassage() {
        log('clearPassage')

        if (this.signedUrl) this.signedUrl = null
        if (this.playing) this.playing = false
    }

    // startTime = null, means play from current position
    // endTime = null, means play through until end
    // rate = null, means 1.0
    // VideoMain is the primary listener for this event.
    play(startTime, endTime, rate) {
        log(`play ${startTime} to ${endTime}, rate=${rate}`)
        this.emit('play', startTime, endTime, rate)
    }

    playSignedUrl(signedUrl) {
        log(`playSignedUrl ${signedUrl.slice(0,80)}`)

        this.signedUrl = signedUrl
    }

    setCurrentTime(currentTime) {
        //!! error if not in range 0..duration
        this.currentTime = currentTime
        this.emit('setCurrentTime')
    }

    togglePlayRecord() {
        log('togglePlayRecord')

        if (this.playing || this.recordingPath) this.stop()
        if (this.signedUrl && !this.playing) this.play()
    }

}

export default VideoRemote
