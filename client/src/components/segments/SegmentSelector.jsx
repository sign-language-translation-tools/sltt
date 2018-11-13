import React from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
import _ from 'underscore'

//import { displayError } from '../utils/Errors.jsx'
import { PreviousSegmentButton, NextSegmentButton } from '../utils/Buttons.jsx'

const log = require('debug')('sltt:SegmentSelector') 

class SegmentSelector extends React.Component {
    static propTypes = {
        segment: PropTypes.object,
        remote: PropTypes.object.isRequired,
        editing: PropTypes.bool
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
        })
    }

    render() {
        let { segment, remote, editing } = this.props
        let { passageVideo } = remote

        if (!segment || !passageVideo) return null

        let segments = passageVideo.sortedSegments || []
        if(!segments.length) return null

        //segments.forEach(seg => console.log(`${seg.position.toFixed(2)}`))

        let idx = _.findIndex(segments, s => s._id === segment._id)
        if (idx === -1) return null

        let gotoSegment = function (seg) {
            log('gotoSegment', seg)
            remote.setCurrentTime(seg.position, true)
        }

        let enableLeft, enableRight
        // Don't allow changing the currently selected segment if we are in the middle
        // of an edit
        if (!editing) {
            enableLeft = idx > 0
            enableRight = idx < segments.length - 1
        }

        return (
            <div className="segment-selector">
                <PreviousSegmentButton
                    enabled={ enableLeft }
                    tooltip={'Go to previous segment.'}
                    onClick={ () => gotoSegment(segments[idx-1]) } />
                <span className="segment-selector-text">
                    {idx+1} of {segments.length}
                </span>
                <NextSegmentButton
                    enabled={enableRight}
                    tooltip={'Go to next segment.'}
                    onClick={() => gotoSegment(segments[idx + 1])} />&nbsp;&nbsp;
            </div>
        )
    }

}

export default observer(SegmentSelector)