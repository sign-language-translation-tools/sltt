// VideoToolbar allows controlling playing and recording by means of actions
// and variable of remote (VideoRemote)

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import { displayError } from '../utils/Errors.jsx'

import {PlayButton, PauseButton, RecordButton, StopButton, CreateNoteButton, 
    TourButton } from '../utils/Buttons.jsx'
import { PassageSegmentsIcon } from '../utils/Icons.jsx'
import PassageStatusSelector from '../passages/PassageStatusSelector.jsx'
import PassageVideoSelector from '../passages/PassageVideoSelector.jsx'


class VideoToolbar extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
        createNote: PropTypes.func,
        createSegment: PropTypes.func,
        recordVideo: PropTypes.func,
        openTour: PropTypes.func,
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {  
        })

        this.defaultH = 60
    }

    render() {
        let { remote, w, createNote, createSegment, recordVideo, project, openTour } = this.props
        
        // h = h || this.defaultH

        let { signedUrl, recordingPath, playing } = remote
        let { passageVideo } = project

        let pauseShown = playing
        let playEnabled = signedUrl && !recordingPath

        let stopShown = recordingPath

        let createNoteEnabled = signedUrl && !playing
        let createSegmentEnabled = passageVideo && !playing

        // If I try to move the following to a .css file it stops working.
        // I have no idea why.
        let passageSegmentIconStyle = {
            cursor: 'pointer',
            verticalAlign: 'middle',
            position: 'relative',
            top: '-17px',
            marginLeft: '11px',
        }

        return (
            <div className="video-toolbar" 
                 width={w}
                 style={ { display: 'flex' } } >

                <div style={ {flex: 1} } >
                    { !pauseShown &&
                        <PlayButton
                            enabled={playEnabled}
                            onClick={() => remote.play.bind(remote)()}
                            title="Play video. Shortcut: <Ctrl>space." /> 
                    }

                    { pauseShown &&
                        <PauseButton
                            enabled={true}
                            onClick={remote.stop.bind(remote)}
                            title="Pause video. Shortcut: <Ctrl>space." /> 
                    }

                    { !stopShown &&
                        <RecordButton
                            enabled={recordVideo && !playing}
                            onClick={recordVideo}
                            title="Record video." /> 
                    }

                    { stopShown &&
                        <StopButton
                            enabled={true}
                            onClick={() => remote.stop.bind(remote)()}
                            title="Pause video. Shortcut: <Ctrl>space." /> 
                    }

                    { createNote &&
                        <CreateNoteButton
                            enabled={createNoteEnabled}
                            onClick={() => createNote(remote.currentTime)} /> 
                    }

                    {createSegment &&
                        <PassageSegmentsIcon
                            className={'sl-create-passage-segment'}
                            style={passageSegmentIconStyle}
                            tooltip="Create new segment in this video"
                            enabled={createSegmentEnabled}
                            onClick={() => createSegment(remote.currentTime)} />
                    }

                </div>

                <div className="video-toolbar-right"
                     style={{ flex: 1, flexGrow: 0 }}>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div>
                            {passageVideo &&
                                <PassageVideoSelector project={project} remote={remote} />
                            }
                        </div>
                        <div>
                            {passageVideo &&
                                <PassageStatusSelector 
                                    project={project} 
                            onDelete={this.onDelete.bind(this)} /> }
                        </div>
                        <div>
                            <TourButton
                                tooltip="Click to take a guided tour of this page."
                                onClick={() => openTour && openTour()} />
                        </div>
                    </div>
                </div> 
        </div>
        )
    }

    onDelete() {
        let { project, remote } = this.props
        let { passage } = project

        remote.setSignedUrl(null)

        // Find the first not deleted video, if any
        let passageVideo = passage.videosNotDeleted.slice(-1)[0]  // might be null if no video remaining

        project.setPassageVideo(passage, passageVideo, err => {
            if (err) { displayError(err); return }

            if(!passageVideo) {
                remote.setSignedUrl(null)
                return
            }

            passageVideo.getSignedUrl()
                .then(signedUrl => {
                    remote.setSignedUrl(signedUrl)
                })
                .catch(err => {
                    displayError(err)
                })
        })
    }

    adjustCurrentTime(delta) {
        let { remote } = this.props
        remote.setCurrentTime(remote.currentTime + delta)
    }
}

export default observer(VideoToolbar)