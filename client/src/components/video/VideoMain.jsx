
import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
import PropTypes from 'prop-types'
//import MouseHoveringDetection from 'react-detect-mouse-over' // could not make this work
//import _ from 'underscore'

import VideoToolbar from './VideoToolbar.jsx'
import VideoPlayer from './VideoPlayer.jsx'
import VideoRecorder from './VideoRecorder.jsx'
import VideoPositionBar from './VideoPositionBar.jsx'
import VideoMessage from './VideoMessage.jsx'
import NoteBar from '../notes/NoteBar.jsx'
import { user } from '../auth/User.js'
import { timestamp } from '../../models/Passages.js'
import { displayError } from '../utils/Errors.jsx'

import "./Video.css"

const log = require('debug')('sltt:VideoMain') 



class VideoMain extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
        project: PropTypes.object.isRequired, 
        openTour: PropTypes.func,    // call this to start tour
        tourOpen: PropTypes.bool,    // true iff tour is in progress
    }

    constructor(props) {
        super(props)

        extendObservable(this, {  
        })

        let { remote } = this.props

        this.recordingDoneListener = remote.addListener('recording_done', this.recordingDone.bind(this))
    }

    componentDidMount() {
        let { project, remote } = this.props
        remote.loadPassage(project.passage)
        this.keydownListener = window.addEventListener('keydown', this.keydown.bind(this))
    }

    componentWillUpdate() {
        let { remote } = this.props

        if (document.webkitFullscreenElement && !remote.playing) {
            document.webkitCancelFullScreen()
        }

    }

    componentWillUnmount() {
        //this.recordListener.remove()
        this.keydownListener && this.keydownListener.remove()
        this.recordingDoneListener && this.recordingDoneListener.remove()
    }

    render() {
        //console.log('render VideoMain')
        let { project, remote, w, h, openTour, tourOpen } = this.props
        let { signedUrl, recordingPath } = remote

        // Force re-render when passage changes
        // eslint-disable-next-line
        let { portion, passage, iAmTranslator, iAmConsultant } = project

        //log(`render`, signedUrl, iAmConsultant)

        let showVideoRecorder = recordingPath
        let showVideoPlayer = signedUrl && !showVideoRecorder

        let recordVideo = null
        if (portion && passage && iAmTranslator) {
            recordVideo = this.recordVideo.bind(this)
        }
        
        let createNote = null
        if (signedUrl && iAmConsultant) {
            createNote = (duration) => project.createNote(duration)
        }

        return (
            <div className="video-main" style={ {width: w+12} } >
                <VideoToolbar
                    w={w}
                    remote={remote}
                    project={project}
                    openTour={openTour}
                    recordVideo={recordVideo}
                    createNote={createNote} />

                <div className='video-area' 
                    style={ {width: w, height: h} } >
                    { showVideoRecorder &&
                        <VideoRecorder 
                            w={w} 
                            h={h} 
                            remote={remote} 
                            recordVideo={this.recordVideo.bind(this)} />
                    }
                    
                    { showVideoPlayer &&
                        <VideoPlayer w={w} h={h} remote={remote} autoPlay={false} />
                    }

                    { !showVideoRecorder && !showVideoPlayer &&
                        <VideoMessage project={project} remote={remote} />
                    }
                </div>

                <VideoPositionBar w={w} remote={remote} />
                <NoteBar project={project} remote={remote} w={640} tourOpen={tourOpen} />
            </div>
        )
    }

    recordVideo() {
        log(`recordVideo`)

        let { project, remote } = this.props
        let { portion, passage } = project

        this.videoCreated = timestamp()

        let p = [
            project.name,
            portion.name,
            passage.name,
            this.videoCreated,
        ]
        let path = `${p[0]}/${p[1]}/${p[2]}/${p[3]}.webm`

        remote.record(project.name, path)
    }

    recordingDone(err, url, duration) {
        if (err) {
            log(`recordingDone ERR=${err}`)
            displayError(err)
            return
        }
        log(`recordingDone`, url, duration)

        
        let { project, remote } = this.props
        let { passage } = project
        let { videoCreated } = this

        let doc = { videoCreated, username: user.username, duration, url }

        passage.addVideo(doc, (err, passageVideo) => {
            if (err) { displayError(err); return }

            project.setPassageVideo(passage, passageVideo, err => {
                if (err) { displayError(err); return }
                // Trigger Load of new video into player
                passageVideo.getSignedUrl()
                    .then(signedUrl => {
                        remote.setSignedUrl(signedUrl)
                    })
                    .catch(err => {
                        displayError(err)
                    })
            })
        })
    }

    keydown(e) {
        //console.log("VideoMain keydown", e.keyCode, e.ctrlKey, e)
        let { remote } = this.props

        let adjustCurrentTime = function(delta) {
            remote.setCurrentTime(remote.currentTime + delta)
        }

        if (e.code === 'ArrowLeft' && e.shiftKey) {
            adjustCurrentTime(-1.0)
            return 
        }

        if (e.code === 'ArrowLeft' && e.ctrlKey) {
            adjustCurrentTime(-.05)
            return 
        }

        if (e.code === 'ArrowRight' && e.shiftKey) {
            adjustCurrentTime(1.0)
            return 
        }

        if (e.code === 'ArrowRight' && e.ctrlKey) {
            adjustCurrentTime(.05)
            return 
        }

        if (e.key === ' ' /* && e.ctrlKey */ && remote.status === 'recording') {
            e.preventDefault()
            remote.stop()
            return
        }

        if (e.key === 'F2' && remote.status !== 'recording') {
            remote.record()
            return
        }
    }

}

export default observer(VideoMain)