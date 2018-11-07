
// Display location of notes in this chunk.
// Allow user to click them -> 'noteclicked' event

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
//import classNames from 'classnames'
import PropTypes from 'prop-types' 
//import _ from 'underscore'

import { displayError } from '../utils/Errors.jsx'
import VideoRemote from '../video/VideoRemote.js'
import VideoRecordingToolbar from '../video/VideoRecordingToolbar.jsx'
import VideoRecorder from '../video/VideoRecorder.jsx'
import VideoPlayer from '../video/VideoPlayer.jsx'
import NoteSegment from './NoteSegment.jsx'
// import { displayError } from '../utils/Errors.jsx'

import { user } from '../auth/User.js'
import { timestamp } from '../../models/Passages.js'

class NoteMain extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired, 
        showTextEditor: PropTypes.func.isRequired,   
    }

    constructor(props) {
        super(props)

        this.remote = new VideoRemote()

        extendObservable(this, { 
        })

        this.recordingDoneListener = this.remote.addListener('recording_done', this.addSegment.bind(this))
    }

    render() {
        let { project, w, h, showTextEditor } = this.props
        let { note, iAmConsultant } = project
        let { remote } = this
        let { recordingPath, signedUrl } = remote

        let segments = (note && note.segments) || []
        
        let showVideoRecorder = recordingPath
        let showVideoPlayer = signedUrl && !showVideoRecorder


        if (showVideoPlayer) {
            console.log('NoteMain showVideoPlayer render')
            
            return (
                <div>
                    <VideoPlayer w={w} h={h} remote={remote} 
                                 closeWhenEnded={true}
                                 autoPlay={true} />
                </div>
            )
        }

        if (showVideoRecorder) {
            console.log('NoteMain showVideoRecorder render')
            return (
                <div>
                    <VideoRecordingToolbar 
                       w={w} 
                       remote={remote} 
                       stopRecording={this.stopRecording.bind(this)} />
                    <VideoRecorder w={w} h={h} remote={remote} />
                </div>
            )
        }

        console.log('NoteMain render')

        return (
            <div className='note-display'>
                <div>
                    <table>
                        <tbody>
                            { segments.map((segment) => (
                                <NoteSegment 
                                    project={project}
                                    key={segment.segmentCreated}
                                    note={note}
                                    segment={segment}
                                    remote={remote}
                                />
                            ))}

                            { iAmConsultant && 
                                <tr>
                                    <td></td>
                                    <td>
                                        <div>
                                        <div className="note-record-button note-record-button-video et-right fa fa-3x fa-circle text-danger" 
                                               onClick={this.record.bind(this)} />
                                            <div className="note-record-button note-record-button-write et-right fa fa-3x fa-edit"
                                               onClick={() => { showTextEditor() } } />
                                        </div>
                                        <div>
                                            <div className='note-record-button'>Record Note</div>
                                            <div className='note-record-button'>Write Note</div>
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    stopRecording() {
        let { remote } = this
        remote.stop.bind(remote)()
    }

    record(e) {
        if (e) { e.preventDefault() }

        let { project } = this.props
        let { iAmConsultant, note, portion, passage } = project
        let { remote } = this
        if (!iAmConsultant) return

        this.segmentCreated = timestamp()

        let p = [
            project.name,
            portion.name, 
            passage.name, 
            note.videoCreated,
            note.noteCreated,
            this.segmentCreated,
        ]
        let path = `${p[0]}/${p[1]}/${p[2]}/${p[3]}.${p[4]}.${p[5]}.webm`

        remote.record(project.name, path)
    }

    addSegment(err, url, duration) {
        if (err) {
            displayError(err)
            return
        }

        let text = ''

        let { note } = this.props.project
        let { videoCreated, noteCreated, position } = note

        let doc = {
            segmentCreated: this.segmentCreated,
            videoCreated, noteCreated, username: user.username, position, duration, url, text     
        }

        note.addSegment(doc, err => {
            if (err) {
                console.log('addSegment err:', err)
                return
            }
            
            note.getSignedUrls()   // get signedUrls for all segments (including one just added)
                                   // so that previews display correctly
        })
    }

    componentWillUnmount() {
        this.recordingDoneListener.remove()
    }

}

export default observer(NoteMain)
