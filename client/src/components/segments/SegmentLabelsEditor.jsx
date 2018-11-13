import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
import _ from 'underscore'

import { displayError } from '../utils/Errors.jsx'
import { OkEditSegmentButton, CancelEditSegmentButton } from '../utils/Buttons.jsx'
import SegmentLabelTextEditor from './SegmentLabelTextEditor.jsx'

function LabelEditor({ label, onEnter, onEscape }) {
    return (
        <div>
            <svg width="50" height="30" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle' }}>
                <g>
                    <rect height="27" width="42" y="0" x="0" strokeWidth="1" stroke="#000" fill="#fff" />
                    <text stroke="#000" textAnchor="start" fontFamily="Helvetica, Arial, sans-serif" fontSize="6"
                        x={label.xText} y={label.yText} strokeWidth="0" fill="#000000">ABC</text>
                </g>
            </svg>
            <SegmentLabelTextEditor label={label} _onEnter={onEnter} _onEscape={onEscape} />
        </div>
    )
}

class SegmentLabelsEditor extends Component {
    static propTypes = {
        segment: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
        })

        this.locations = [
            { x: 5, y: 5, xText: 4, yText: 8 },
            { x: 95, y: 5, xText: 26, yText: 8 },
            { x: 5, y: 90, xText: 4, yText: 22 },
            { x: 95, y: 90, xText: 26, yText: 22 },
        ]

        let { segment } = this.props
        let labels = (segment && segment.labels) || []

        this.labels = this.locations.map(loc => {
            let label = _.findWhere(labels, {x: loc.x, y: loc.y})
            return {
                x: loc.x,
                y: loc.y,
                xText: loc.xText,
                yText: loc.yText,
                text: label ? label.text : ''
            }
        })
    }

    render() {
        let onSave = this.save.bind(this)
        let onCancel = () => { this.props.onClose() }

        return (
            <div className="segment-labels-editor">
                <div className="segment-dialog-heading">Edit Segment Labels: </div> 
                <LabelEditor label={this.labels[0]} onEnter={onSave} onEscape={onCancel} />
                <LabelEditor label={this.labels[1]} onEnter={onSave} onEscape={onCancel} />
                <LabelEditor label={this.labels[2]} onEnter={onSave} onEscape={onCancel} />
                <LabelEditor label={this.labels[3]} onEnter={onSave} onEscape={onCancel} />
                <div>
                    <OkEditSegmentButton
                        enabled={true}
                        onClick={onSave} />
                    <CancelEditSegmentButton
                        enabled={true}
                        onClick={onCancel} />
                </div>
            </div>
        )
    }

    save() {
        let { segment } = this.props

        let labels = this.labels.filter(label => label.text)
        segment.setLabels(labels, err => {
            if (err) displayError(err)
        })

        this.props.onClose()
    }

}

export default observer(SegmentLabelsEditor)