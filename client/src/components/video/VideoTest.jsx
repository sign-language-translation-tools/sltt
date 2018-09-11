// This component is used to exercise VideoMain and its subcomponents

import React, { Component } from 'react'
import { Provider } from 'mobx-react'
import PropTypes from 'prop-types'

import VideoMain from './VideoMain.jsx'
import VideoRemote from './VideoRemote.js'

class VideoTest extends Component {
    constructor(props) {
        super(props)

        let remote = new VideoRemote()

        remote.path = '_email/Nathan Miles.webm'
        remote.allowRecord = true
        remote.allowCreateNote = false
        
        this.remote = remote
    }

    render() {
        let project = {

        }

        return (
            <Provider project={ project } >
                <VideoMain w={640} h={480} remote={this.remote} />
            </Provider>
        )
    }

}

export default VideoTest
