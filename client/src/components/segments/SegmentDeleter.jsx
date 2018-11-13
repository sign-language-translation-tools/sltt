import React from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
import { confirmAlert } from 'react-confirm-alert'

import { displayError } from '../utils/Errors.jsx'
import { DeleteSegmentButton } from '../utils/Buttons.jsx'

// const log = require('debug')('sltt:SegmentDeleter') 

class SegmentDeleter extends React.Component {
    static propTypes = {
        segment: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        iAmConsultant: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
        })
    }

    render() {
        let { segment, remote, iAmConsultant } = this.props
        let { passageVideo } = remote
        if (!segment || !passageVideo) return null

        let segments = (passageVideo && passageVideo.sortedSegments) || []

        let enabled = true
        let tooltip = 'Delete this segment.'

        if (segment._id === segments[0]._id) {
            enabled = false
            tooltip = 'You cannot delete the first segment.'
        }

        return (
            <DeleteSegmentButton
                enabled={enabled && iAmConsultant}
                tooltip={tooltip}
                onClick={this.delete.bind(this)} />
        )
    }

    confirmDeletion(doDeletion) {
        // No need to confirm, if no video has been recorded yet
        confirmAlert({
            title: `DELETE this segment?!`,
            message: 'Only the segment bar and labels will be deleted. The recorded video is not affected. You cannot undo this operation.',
            confirmLabel: 'Delete!!!',
            cancelLabel: 'Keep.',
            onConfirm: doDeletion,
            onCancel: () => { },
        })
    }

    delete() {
        let { remote, segment } = this.props
        let { passageVideo } = remote
        let { position } = segment

        this.confirmDeletion(() => {
            passageVideo.removeSegment(segment.segmentCreated)
                .then(() => {
                    remote.setCurrentTime(position, true)
                })
                .catch(err => {
                    displayError(err)
                })
        })
    }
}

export default observer(SegmentDeleter)