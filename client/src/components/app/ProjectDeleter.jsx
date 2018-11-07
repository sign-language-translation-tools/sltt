import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'

import { userProjects } from './UserProjects.js'
import { displayError } from '../utils/Errors.jsx'

class ProjectDeleter extends Component {
    static propTypes = {
        projectName: PropTypes.string.isRequired,
    }

    render() {
        return (
            <span className="delete-project-button"
                href="#"
                data-toggle="tooltip"
                title="Delete project."
                onClick={this.onDelete.bind(this)} >
                   <i className="fa fa-fw fa-trash"></i>
            </span>
        )
    }

    confirmDeletion(doDeletion) {
        // No need to confirm, if no video has been recorded yet
        let { projectName } = this.props

        confirmAlert({
            title: `DELETE ${projectName} project!!!`,
            message: 'We move it to sltt_deleted_projects directory on the server so in theory we can get it back.',
            confirmLabel: 'Delete!!!',
            cancelLabel: 'Keep.',
            onConfirm: doDeletion,
            onCancel: () => { },
        })
    }

    onDelete(e) {
        e.preventDefault()
        let { projectName } = this.props

        this.confirmDeletion(() => {
            userProjects.deleteProject(projectName, err => {
                if (err) {
                    displayError(err)
                }
            })
        })
    }

}

export default ProjectDeleter