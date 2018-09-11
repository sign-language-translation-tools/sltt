import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
//import PropTypes from 'prop-types'
//import classNames from 'classnames'

import VideoRecorder from './VideoRecorder.jsx'
import VideoRemote from './VideoRemote.js'
import { RecordButton, StopButton } from './VideoButton.jsx'


class VideoEmail extends Component {
    constructor(props) { 
        super(props)

        extendObservable(this, {  
        })

        let chunk = {}
        chunk.path = () => 'test3.mp4'

        let remote = new VideoRemote()
        remote.chunk = chunk
        this.remote = remote
    }

    render() {
        let { remote } = this
        let { status } = remote

        let canRecord = ['novideo', 'uploaded', 'error'].includes(status)
        let canStop = ['recording'].includes(status)

        return (
            <div>
                <div>
                    <RecordButton 
                        enabled={canRecord}
                        onClick={() => remote.record()} />
                    <StopButton 
                        enabled={canStop}
                        onClick={() => remote.stop()} />
                </div>
                    <VideoRecorder 
                        w={640} 
                        h={480}
                        videoRemote={remote} />
            </div>
        )
    }

}

export default observer(VideoEmail)
