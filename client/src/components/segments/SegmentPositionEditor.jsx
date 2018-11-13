import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
//import _ from 'underscore'

import { displayError } from '../utils/Errors.jsx'
import { OkEditSegmentButton, CancelEditSegmentButton, AdjustCurrentTimeButtons } from '../utils/Buttons.jsx'

class SegmentPositionEditor extends Component {
    static propTypes = {
        segment: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        let { segment, remote } = this.props

        extendObservable(this, {
            position: segment.position
        })

        remote.editingSegmentPosition = true // stop updating currently selected segment when video position changes

        this.setCurrentTimeListener = remote.addListener('setCurrentTime', this.onSetCurrentTime.bind(this))
    }

    componentWillUnmount() {
        let { remote } = this.props
        remote.editingSegmentPosition = false // resume updating currently selected segment when video position changes

        // This will force the current segment to be selected
        remote.setCurrentTime(this.position)

        this.setCurrentTimeListener.remove()
    }

    // When current position in video changes, save the new position
    onSetCurrentTime() {
        let { remote } = this.props
        this.position = remote.currentTime
    }

    render() {
        let { position } = this

        return (
            <div className="segment-position-editor">
                <div className="segment-dialog-heading">Edit Segment Position: </div>
                <div> 
                    <span className="segment-heading">Starts At:</span>
                    <span className="segment-position-text">{position.toFixed(2)}</span>
                </div>
                <br/>
                <div>
                    To change start position of this segment click in the timeline OR
                    use the fine adjustment controls (
                        <AdjustCurrentTimeButtons 
                            enabled={true} 
                            adjustCurrentTime={this.adjustCurrentTime.bind(this)} />
                    ).
                </div>
                <div>
                    <OkEditSegmentButton
                        enabled={true}
                        onClick={this.save.bind(this)} />
                    <CancelEditSegmentButton
                        enabled={true}
                        onClick={() => this.props.onClose() } />
                </div>
            </div>
        )
    }

    adjustCurrentTime(delta) {
        let { remote } = this.props
        let { currentTime } = remote
        remote.setCurrentTime(currentTime + delta)
    }

    save() {
        let { segment } = this.props

        segment.upsertPosition(this.position, err => {
            if (err) displayError(err)
        })

        this.props.onClose()
    }

}

export default observer(SegmentPositionEditor)