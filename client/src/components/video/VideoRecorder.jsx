// This component controls the recording of videos.
// It displays the video while the recording is happening.
// It primarily communicates with other components via the 'remote' (VideoRemote) prop

import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import "./Video.css"
import { displayError } from '../utils/Errors.jsx'

const log = require('debug')('sltt:VideoRecorder') 


class VideoRecorder extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
    }

    constructor(props) {
        super(props)

        let { remote } = this.props

        extendObservable(this, { 
            videoSrc: '',
        })

        //this.recordListener = remote.addListener('record', this.record.bind(this))
        this.stopListener = remote.addListener('stop', this.stop.bind(this))
    }

    componentDidMount() {
        setTimeout(() => this.record(), 1000)
    }

    componentWillUnmount() {
        //this.recordListener.remove()
        this.stopListener.remove()
    }

    render() {
        let { w, h, remote } = this.props

        return (
            <div className="video-recorder video-border">
                <div>
                    <video 
                        ref={(vc) => { this.vc = vc }} 
                        autoPlay={true}
                        width={w}
                        height={h}
                        onClick={remote.stop.bind(remote)}
                      />
                </div> 
            </div>
        )
    }

    async record()
    {        
        let { remote } = this.props
        //let setStatus = remote.setStatus.bind(remote)

        try {
            log("recording_initializing")
            let mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            })

            log('get mediaStream')

            remote.initializeRecording()
            let recorder = new MediaRecorder(mediaStream)
            this.recorder = recorder

            recorder.ondataavailable = this.dataAvailable.bind(this)
            recorder.onstop = remote.finalizeRecording.bind(remote)

            this.vc.srcObject = mediaStream

            log("recording start")
            recorder.start(3000)
        } catch (error) {
            log("record error", error)
        }            
    }

    dataAvailable(event) {
        let { data } = event
        let { remote } = this.props
        let push = remote.push.bind(remote)

        log('dataAvailable')
        push(data)
            .then(() => {
                log('dataAvailable done')
            })
            .catch(err => {
                log('push error', err)
                this.stop()
                displayError(err)
            })
    }

    // Event handler for remote object stop event
    stop() {
        let { recorder } = this
        
        log('stop')
        try {
            recorder && recorder.stop()
            this.recorder = null
        } catch (error) {
            log(`stop ERROR=${JSON.stringify(error)}`)
        }
    }

}

export default observer(VideoRecorder)
