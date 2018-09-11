// This component is used to exercise TranslationEditor and its subcomponents

import React, { Component } from 'react'
import { user } from '../auth/User.js'

import TranslationEditor from './TranslationEditor.jsx'
//import { project } from '../../models/_MemoryProject.js'
import { project, initializeProject } from '../../models/_LocalProject.js'

class TranslationEditorTest extends Component {
    componentWillMount() {
        initializeProject()
    }

    render() {
        if (!user.id_token) return null

        return (
            <TranslationEditor project={project} />
        )
    }

}

export default TranslationEditorTest
