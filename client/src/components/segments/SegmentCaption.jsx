import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'

//import { displayError } from '../utils/Errors.jsx'
import { EditSegmentButton } from '../utils/Buttons.jsx'
import { DictateSegmentButton } from '../utils/Buttons.jsx'
import SegmentCaptionEditor from './SegmentCaptionEditor.jsx'

class SegmentCaption extends Component {
    static propTypes = {
        segment: PropTypes.object,
        remote: PropTypes.object,
        iAmConsultant: PropTypes.bool,
        setEditing: PropTypes.func.isRequired,
        tourSelector: PropTypes.string,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            editing: false,
        })
    }

    render() {
        let { segment, remote, setEditing, iAmConsultant, tourSelector } = this.props
        if (!segment) return null

        if (this.editing)
            return (<SegmentCaptionEditor 
                        segment={segment}
                        remote={remote}
                        onClose={() => {
                            setEditing(false)
                            this.editing = false
                        } } />)

        let value = 'Un hombre tenía dos hijos. El menor de ellos dijo ...'

        return (
            <div className="segment-caption">
                <div>
                    <span className="segment-heading segment-caption-heading">CC:</span> 
                    <EditSegmentButton
                        className="sl-edit-segment-caption-button"
                        tourSelector={tourSelector}
                        tooltip='Edit caption for segment.'
                        enabled={iAmConsultant}
                        onClick={() =>  { 
                            setEditing(true)
                            this.editing = true 
                        } } />&nbsp;
                    <DictateSegmentButton
                        className="sl-dictate-segment-caption-button"
                        tourSelector={tourSelector}
                        tooltip='Dictate caption for segment.'
                        enabled={iAmConsultant}
                        onClick={() => {
                            setEditing(true)
                            this.editing = true
                        }} />
                </div>
                <div>
                    <textarea id="story" name="story"
                        rows="10" cols="50" defaultValue={value} />
                </div>
            </div>
        )
    }
}

export default observer(SegmentCaption)