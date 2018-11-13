import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'

//import { displayError } from '../utils/Errors.jsx'
import { EditSegmentButton } from '../utils/Buttons.jsx'
import SegmentLabelsEditor from './SegmentLabelsEditor.jsx'

class SegmentLabels extends Component {
    static propTypes = {
        segment: PropTypes.object,
        setEditing: PropTypes.func.isRequired,
        iAmConsultant: PropTypes.bool,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            editing: false,
        })
    }

    render() {
        let { segment, setEditing, iAmConsultant } = this.props
        if (!segment) return null

        if (this.editing)
            return (<SegmentLabelsEditor 
                        segment={segment}
                        onClose={() => { 
                            setEditing(false)
                            this.editing = false
                        } } />)

        let labels = (segment && segment.labels) || []
        let texts = labels.filter(label => label.text).map(label => label.text)

        let labelsText = texts.length ? texts.join(' / ') : '-'

        return (
            <div className="segment-labels">
                <span className="segment-heading">Labels:</span> 
                <span className="segment-label-text">{ labelsText }</span>
                <EditSegmentButton
                    tooltip="Edit labels for this segment."
                    enabled={segment && iAmConsultant}
                    onClick={() => { 
                        setEditing(true)
                        this.editing = true 
                    } } />
            </div>
        )
    }
}

export default observer(SegmentLabels)