import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'

const PassageEditor = observer(class PassageEditor extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        passage: PropTypes.object.isRequired,
        done: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        extendObservable(this, { 
        })
    }

    render() {
        return (
            <div className="passage-box">
                <TextInput
                    message="Type Enter to change name or Esc to cancel."
                    initialValue={this.props.passage.name}
                    validate={this.validate.bind(this)}
                    _onCancel={this.props.done}
                    _onEnter={this.onEnter.bind(this)} />
            </div>
        )
    }

    onEnter(newPassageName) { 
        let { project, done } = this.props
        let { portion } = project
        let _id = project.passage._id

        portion.addPassage(newPassageName)
        portion.removePassage(_id)

        let newPassage = portion.passages[portion.passages.length - 1]
        project.setPassage(newPassage)

        done()
    }

    validate(newPassageName) {
        return this.props.project.portion.checkName(newPassageName)
    }

})

export default PassageEditor