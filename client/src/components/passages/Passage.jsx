import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import className from 'classname'
//import { MouseHoveringDetection } from 'react-detect-mouse-over'
import 'react-confirm-alert/src/react-confirm-alert.css'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'

import './Passage.css'
import PassageEditor from './PassageEditor.jsx'
import VideoDropTarget from './VideoDropTarget.jsx'
import { displayError, displaySuccess } from '../utils/Errors.jsx'

const debug = require('debug')('sltt:Passage') 

// TODO Move code to support menu actions to a seperate component

const Passage = observer(class Passage extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        passage: PropTypes.object.isRequired,
        forceUpdate: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
            mode: '',
            percent: 0, 
            droptarget: false,
            showCommands: false,
        })
    }

    done() { this.mode = '' }

    render() {
        let {project, passage } = this.props
        let { iAmTranslator } = project
        let { videos } = passage

        let present = videos.length > 0
        let passageSelected = project.passage && passage && (project.passage.name === passage.name)

        if (this.mode === 'editing') 
            return ( <PassageEditor 
                        project={project} 
                        passage={passage} 
                        done={this.done.bind(this)} /> )

        let buttonCN = className(
            {
                "btn": true,
                "passage-button": true,
                "passage-selected": passageSelected,
                "passage-video-present": present,
            },
        )

        return (
            <div className={'passage-box'} >
                <VideoDropTarget iAmTranslator={project.iAmTranslator} uploadFile={this.uploadFile.bind(this)}>
                    <button className={buttonCN} onClick={this.onClick} >
                        {passage.name}
                    </button>
                </VideoDropTarget>

                {iAmTranslator && this.menu()}
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isHoveringOver && nextProps.isHoveringOver && this.showCommands) {
            this.showCommands = false
        }
    }

    menu() {
        let { project } = this.props
        let { iAmTranslator } = project
        if (!iAmTranslator) return null

        let renameSupported = false // enable after support for renaming ready

        if (!this.showCommands && renameSupported) {
            return ( 
                 <span className="passage-menu passage-show-commands"
                             href="#" 
                             data-toggle="tooltip" 
                             title="Click to see commands." 
                             onClick={this.onShowCommands.bind(this)}>
                        <i className="fa fa-toggle-right"></i>
                 </span>
            )
        }

        return (
            <div className="passage-menu">
                 { renameSupported && 
                    <span className="passage-menu-button"
                                 href="#" 
                                 data-toggle="tooltip" 
                                 title="Rename passage." 
                                 onClick={this.onEdit.bind(this)}>
                            <i className="fa fa-fw fa-pencil"></i>
                     </span>
                 }
                <span className="passage-menu-button"
                             href="#" 
                             data-toggle="tooltip" 
                             title="Delete passage."    
                             onClick={this.onDelete.bind(this)}>
                        <i className="fa fa-fw fa-trash"></i>
                    </span>
            </div>
         )
    }

    onClick = (e) => {
        e.preventDefault()
        //console.log('onClick')
        this.setPassage()
    }

    onShowCommands(e) {
        e.preventDefault()
        this.showCommands = true
    }

    onEdit(e) {
        e.preventDefault()
        this.mode = 'editing'
    }

    confirmDeletion(doDeletion) {
        // No need to confirm, if no video has been recorded yet
        let { passage } = this.props
        if (!passage.videod()) { doDeletion(); return }

        confirmAlert({
                    title: 'Delete video!?',    
                    message: 'Video has already been recorded for this passage.', 
                    confirmLabel: 'Delete video!',    
                    cancelLabel: 'Keep video.',    
                    onConfirm: doDeletion, 
                    onCancel: () => {}, 
                })
    }

    onDelete(e) { 
        e.preventDefault()

        this.confirmDeletion( () => {
            let { project, passage, forceUpdate } = this.props
            project.setPassage(null)
            project.portion.removePassage(passage._id)

            // Update containing component.
            // This should happen automatically but it doesn't and I don't know why.
            forceUpdate()
        })
    }

    uploadFile(file, onprogress, ondone) {
        debug(`uploadFile ${file}`)
        let { passage } = this.props
        
        passage.uploadFile(file, 
            onprogress, 
            (err) => {
                debug(`uploadFile err = ${err}`)
                ondone && ondone()

                if (err) {
                    displayError(err)
                    return
                }

                debug(`uploadFile success`)
                displaySuccess(`${passage.name} uploaded!`) 
                this.setPassage()
            })
    }

    setPassage() {
        let { project, passage, remote } = this.props

        project.setPassage(passage, err => {
            if (err) {
                displayError(err)
                return
            }
            remote.loadPassage(passage)
        })
    }
})

// CRASHING when I try to use MouseHoveringDetection
//export default MouseHoveringDetection(Passage)

export default Passage