// Allow user to select which portion in the current project they wish to work with
import React, { Component } from 'react'
import PropTypes from 'prop-types' 
import { statuses } from '../../models/PassagesStatus.js'

class PassageStatus extends Component {
    static propTypes = {
        passageVideo: PropTypes.object.isRequired,
        allowSingleStar: PropTypes.bool,
    }

    render() {
        let { passageVideo, allowSingleStar } = this.props

        let status = passageVideo.status
        if (!allowSingleStar && status === 0) return null

        return ( 
            <span className="passage-status">
                {statuses[status]}
            </span>
        )
    }
}

export default PassageStatus
