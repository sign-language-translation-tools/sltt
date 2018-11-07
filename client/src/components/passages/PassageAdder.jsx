import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'

const PassageAdder = observer(class PassageAdder extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        forceUpdate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        extendObservable(this, { 
            adding: false,
        })
    }

    render() {
        let { project } = this.props

        if (!project.iAmTranslator) return null

        if (!this.adding)
            return (
                <div
                    className="passage-adder"
                    data-toggle="tooltip" title="Add new passage." 
                    onClick={ () => {
                        this.adding = true; this.name = ''
                    } }>
                    <i className="fa fa-fw fa-plus-square-o"></i>
                </div>
            )

        return (
            <div className="passage-box">
                <TextInput
                    message="Type Enter to add new passage or Esc to cancel."
                    initialValue=""
                    validate={this.validate.bind(this)}
                    _onEscape={this.onCancel.bind(this)}
                    _onEnter={this.onEnter.bind(this)} />
            </div>
        )
    }

    onCancel() { 
        this.adding = false
    }

    onEnter(newPassageName) { 
        let { project, forceUpdate } = this.props
        let { portion } = project

        portion.addPassage(newPassageName)

        let newPassage = portion.passages[portion.passages.length - 1]
        project.setPassage(newPassage)

        // If I don't do this the list of passages is not immediately updated.
        // I am not sure why this is necessary.
        forceUpdate()

        this.adding = false
    }

    validate(newPassageName) {
        return this.props.project.portion.checkName(newPassageName)
    }

})

export default PassageAdder