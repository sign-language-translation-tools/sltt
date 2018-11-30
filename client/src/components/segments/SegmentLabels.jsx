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
        tourSelector: PropTypes.string,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            editing: false,
        })
    }

    render() {
        let { segment, setEditing, iAmConsultant, tourSelector } = this.props
        if (!segment) return null

        if (this.editing || tourSelector === '.segment-labels-top-left' || tourSelector === '.sl-ok-edit-segment-lables-button')
            return (<SegmentLabelsEditor 
                        segment={segment}
                        onClose={() => { 
                            setEditing(false)
                            this.editing = false
                        } } />)

        let labels = (segment && segment.labels) || []
        let texts = labels.filter(label => label.text).map(label => label.text)

        let labelsText, labelHeading
        
        switch(texts.length) {
            case 0:
                labelHeading = 'Label'
                labelsText = '-'
                break
            case 1:
                labelHeading = 'Label'
                labelsText = texts[0]
                break
            default:
                labelHeading = 'Labels'
                labelsText = texts.join(' / ')
                break
        }

        return (
            <div className="segment-labels">
                <span className="segment-heading">{labelHeading}:</span> 
                <span className="segment-label-text">{ labelsText }</span>
                <EditSegmentButton
                    className="sl-edit-segment-labels-button"
                    tourSelector={tourSelector}
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