// Display note selected by user OR create new note

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import classNames from 'classnames'
import PropTypes from 'prop-types' 

import NoteMain from './NoteMain.jsx'
import './Note.css'
import '../video/Video.css'
import { user } from '../auth/Auth.js'
import { timestamp } from '../../models/Passages.js'
import NoteTextEditor from './NoteTextEditor.jsx'


class NoteDialog extends Component {
    static propTypes = {
        project: PropTypes.object,  
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
            showTextEditor: false,
        })
    }

    render() {
        let { project } = this.props
        let { note, passage, iAmConsultant } = project
        let { showTextEditor } = this

        if (!note) return null

        this.title = (passage && passage.name) || ""

        let cns = classNames("modal", "fade", "note-modal-dialog", "in", "show")

        return (
            <div className={cns} id="noteDialog">
                <div className="note-modal-dialog" role="document" >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">
                                Project Note: {this.title}
                                <button 
                                    type="button" 
                                    className="btn btn-sm pull-right" 
                                    onClick={this.closeNoteDialog.bind(this)} >
                                        <span aria-hidden="true">&times;</span>
                                </button>
                            </h4>
                        </div>

                        <div className="modal-body">
                            <div className="note-container">
                                <div className="note-fixedpane1 note-padleft" >
                                    { !showTextEditor &&
                                        <NoteMain 
                                            project={project} 
                                            w={640} h={480}
                                            showTextEditor={ () => { this.showTextEditor = true } }
                                             /> }
                                    { showTextEditor &&
                                        <div className="note-text-editor-div">
                                            <NoteTextEditor 
                                                onSave={this.onSave.bind(this)}
                                                onCancel={() => { this.showTextEditor = false }} />
                                        </div> }
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            {(!showTextEditor && iAmConsultant) && 
                                <button type="button" 
                                    className={"btn pull-left btn-primary"} 
                                    onClick={this.resolveNote.bind(this)}>Resolve</button> }
                            { !showTextEditor && 
                                <button type="button" 
                                    className={"btn btn-default btn-primary"} 
                                    onClick={this.closeNoteDialog.bind(this)}>Close</button> }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    onSave(text) {
        let { note } = this.props.project
        let { videoCreated, noteCreated, position } = note

        let doc = {
            url: '',
            duration: 0.0,
            segmentCreated: timestamp(),
            username: user.username,
            text,
            videoCreated, 
            noteCreated, 
            position, 
        }

        note.addSegment(doc, err => {
            if (err) {
                console.log('addSegment err:', err)
                return
            }
        })

        this.showTextEditor = false
    }

    resolveNote() {
        let { project } = this.props
        let { note } = project

        note.resolve()
        this.closeNoteDialog()
    }

    closeNoteDialog() {
        let { project } = this.props
        project.unsetNote()
    }

}

export default observer(NoteDialog)
