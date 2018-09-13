// VideoToolbar allows controlling playing and recording by means of actions
// and variable of remote (VideoRemote)

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'

import {
    PlayButton, PauseButton, RecordButton, StopButton, CreateNoteButton, CreateLabelButton} from '../utils/Buttons.jsx'
import PassageStatusSelector from '../passages/PassageStatusSelector.jsx'
import PassageVideoSelector from '../passages/PassageVideoSelector.jsx'


class VideoToolbar extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
        createNote: PropTypes.func,
        recordVideo: PropTypes.func,
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {  
        })

        this.defaultH = 60
    }

    render() {
        let { remote, w, createNote, createLabel, recordVideo, project } = this.props
        
        // h = h || this.defaultH

        let { signedUrl, recordingPath, playing } = remote
        let { passageVideo } = project

        let pauseShown = playing
        let playEnabled = signedUrl && !recordingPath

        let stopShown = recordingPath

        let createNoteEnabled = signedUrl && !playing

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
                            enabled={recordVideo}
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

                    {createLabel &&
                        <CreateLabelButton
                            enabled={createNoteEnabled}
                        onClick={() => createLabel && createLabel(remote.currentTime)} />
                    }

                    
                </div>
                
                <div style={{ flex: 1 }}>
                    {passageVideo &&
                        <PassageStatusSelector project={project} />
                    }
                    {passageVideo &&
                        <PassageVideoSelector project={project} remote={remote} />
                    }
                </div>
        </div>
        )
    }

    adjustCurrentTime(delta) {
        let { remote } = this.props
        remote.setCurrentTime(remote.currentTime + delta)
    }
}

export default observer(VideoToolbar)