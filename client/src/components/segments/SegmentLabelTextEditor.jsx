import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'

class SegmentLabelTextEditor extends Component {
    static propTypes = {
        label: PropTypes.object.isRequired,
        _onEnter: PropTypes.func,
        _onEscape: PropTypes.func,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            value: this.props.label.text
        })
    }

    render() {
        let { value } = this

        return (
            <span>
                <input
                    className="segment-label-text-editor"
                    type={'text'}
                    value={value}
                    onKeyDown={this.onKeyDown.bind(this)}
                    onChange={this.onChange.bind(this)} />
            </span>
        )
    }

    onKeyDown(e) {
        let { _onEnter, _onEscape } = this.props

        // <enter> = complete editing
        if (e.keyCode === 13) {
            _onEnter && _onEnter()
            return
        }

        // <esc> = abandon edit
        if (e.keyCode === 27) {
            _onEscape && _onEscape()
            return
        }
    }

    onChange(e) {
        let { label } = this.props
        this.value = e.target.value
        label.text = this.value
    }

}

export default observer(SegmentLabelTextEditor)