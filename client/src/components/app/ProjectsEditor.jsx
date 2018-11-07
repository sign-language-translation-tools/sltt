/*
    Show all projects.
    Allow root users to add and remove projects
 */


import React, { Component } from 'react'
//import _ from 'underscore'
//import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'

import ProjectAdder from './ProjectAdder.jsx'
import ProjectDeleter from './ProjectDeleter.jsx'
import { userProjects } from './UserProjects.js'


class ProjectsEditor extends Component {
    constructor(props) {
        super(props)
        extendObservable(this, {
        })
    }

    render() {
        let { projects } = userProjects

        return (
            <div>
                { projects.map(project =>
                    (<p key={project.name}>
                        {project.name}
                        <ProjectDeleter projectName={project.name} />
                    </p>)) 
                }
                <ProjectAdder />
            </div>
        )
    }
}

export default observer(ProjectsEditor)