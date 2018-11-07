import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
//import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'
import { userProjects } from './UserProjects.js'
import { displayError } from '../utils/Errors.jsx'

class ProjectAdder extends Component {
    static propTypes = {
    }

    constructor(props) {
        super(props);

        extendObservable(this, { 
            adding: false,
        })
    }

    render() {
        if (!this.adding)
            return (
                <div
                    className="project-adder"
                    data-toggle="tooltip" title="Add new project." 
                    onClick={ () => {
                        this.adding = true; this.name = ''
                    } }>
                    <i className="fa fa-fw fa-plus-square-o"></i>
                </div>
            )

        return (
            <div className="project-name-box">
                <TextInput
                    message="Type Enter to add new project name or Esc to cancel."
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

    onEnter(newProjectName) { 
        userProjects.createProject(newProjectName, err => {
            if (err) {
                displayError(err)
            }
        })
        this.adding = false
    }

    validate(newProjectName) {
        return userProjects.checkName(newProjectName)
    }

}

export default observer(ProjectAdder)