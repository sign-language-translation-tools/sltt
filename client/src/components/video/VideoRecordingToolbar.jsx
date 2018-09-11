import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'

import { StopButton } from '../utils/Buttons.jsx'


class VideoRecordingToolbar extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number,
        stopRecording: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {  
        })
    }

    render() {
        let { stopRecording, w, h } = this.props
        
        h = h || 60

        return (
            <div className="video-toolbar" 
                 width={w}
                 height={h} >

                    <StopButton
                        enabled={true}
                        onClick={stopRecording}
                        title="Stop recording. Shortcut: <Ctrl>space." /> 
            </div>
        )
    }
}

export default observer(VideoRecordingToolbar)