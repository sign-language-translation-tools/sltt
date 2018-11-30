import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'
//import _ from 'underscore'

//import { displayError } from '../utils/Errors.jsx'
import { OkEditSegmentButton, CancelEditSegmentButton } from '../utils/Buttons.jsx'


class SegmentCaptionEditor extends Component {
    static propTypes = {
        segment: PropTypes.object.isRequired,
        onClose: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
        })
    }

    render() {
        let onSave = this.save.bind(this)
        let onCancel = () => { this.props.onClose() }

        return (
            <div className="segment-captions-editor">
                <div>Segment captions editor...TBD</div>
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
        this.props.onClose()
    }

}

export default observer(SegmentCaptionEditor)