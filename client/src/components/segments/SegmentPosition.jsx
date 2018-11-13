import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'

//import { displayError } from '../utils/Errors.jsx'
import { EditSegmentButton } from '../utils/Buttons.jsx'
import SegmentPositionEditor from './SegmentPositionEditor.jsx'

class SegmentPosition extends Component {
    static propTypes = {
        segment: PropTypes.object,
        remote: PropTypes.object,
        iAmConsultant: PropTypes.bool,
        setEditing: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            editing: false,
        })
    }

    render() {
        let { segment, remote, setEditing, iAmConsultant } = this.props
        if (!segment) return null

        let { position } = segment

        if (this.editing)
            return (<SegmentPositionEditor 
                        segment={segment}
                        remote={remote}
                        onClose={() => {
                            setEditing(false)
                            this.editing = false
                        } } />)

        let enabled = true
        let tooltip = "Edit segment start time."
        if (segment && segment.position === 0) {
            enabled = false
            tooltip = "The first segment must always start at the beginning of the video."
        }

        return (
            <div className="segment-position">
                <span className="segment-heading">Starts At:</span> 
                <span className="segment-position-text">{ position.toFixed(2) }</span>
                <EditSegmentButton
                    tooltip={tooltip}
                    enabled={enabled && iAmConsultant}
                    onClick={() =>  { 
                        setEditing(true)
                        this.editing = true 
                    } } />
            </div>
        )
    }

}

export default observer(SegmentPosition)