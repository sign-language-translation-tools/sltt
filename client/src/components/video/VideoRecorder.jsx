// This component controls the recording of videos.
// It displays the video while the recording is happening.
// It primarily communicates with other components via the 'remote' (VideoRemote) prop

import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import "./Video.css"

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
        let { videoSrc } = this

        console.log('!!!videoRecorder render', remote.recordingPath)
        
        return (
            <div className="video-recorder video-border">
                <div>
                    <video 
                        ref={(vc) => { this.vc = vc }} 
                        autoPlay={true}
                        src={videoSrc}
                        width={w}
                        height={h}
                        onClick={remote.stop.bind(remote)}
                      />
                </div> 
            </div>
        )
    }

    setStatus(status) {
        this.props.remote.setStatus(status)
    }

    record()
    {        
        let { remote } = this.props
        let push = remote.push.bind(remote)

        const initializeRecording = (mediaStream) => {
            remote.initializeRecording()
            
            this.recorder = new MediaRecorder(mediaStream)
            this.recorder.ondataavailable = (event => push(event.data))
            this.recorder.onstop = remote.finalizeRecording.bind(remote)
            
            const url = window.URL.createObjectURL(mediaStream)
            this.videoSrc = url
            
            this.setStatus("recording")
            this.recorder.start(3000)
        }
        
        this.setStatus("recording_initializing")
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        })
        .then(initializeRecording)
        .catch(err => {
            //Bugsnag.notifyException(err)
            let name = err.name || '*noname*'
            let message = err.message || ''
            message = name + "/" + message
            this.setStatus("error", message)
        })
    }

    stop() {
        let { remote } = this.props
        let { status } = remote
        
        console.log('!!!stopping recorder', status)
        if (!['recording_initializing', 'recording'].includes(status)) return

        this.recorder.stop()
    }

}

export default observer(VideoRecorder)
