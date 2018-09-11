import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import className from 'classname'
//import { MouseHoveringDetection } from 'react-detect-mouse-over'
import Progress from 'react-progress'
import 'react-confirm-alert/src/react-confirm-alert.css'
import PropTypes from 'prop-types'
import { confirmAlert } from 'react-confirm-alert'

import './Passage.css'
import PassageEditor from './PassageEditor'
import { displayError, displaySuccess } from '../utils/Errors.jsx'

//!! Code to support drag and drop should be a seperate component
//!! Code to support menu actions should be a seperate component

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

        // if (true) {
        //     return (<p>{passage.name}</p>)
        // }

        let present = videos.length > 0
        let passageSelected = project.passage && passage && (project.passage.name === passage.name)

        if (this.mode === 'editing') 
            return ( <PassageEditor 
                                 project={project} 
                                 passage={passage} 
                                 done={this.done.bind(this)} /> )

        let dropTargetCN = className('passage-box', { "passage-active-droptarget": this.droptarget })

        let buttonCN = className(
            {
                "btn": true,
                "passage-button": true,
                "passage-selected": passageSelected,
                "passage-video-present": present,
            },
        )

        //console.log("cns", this.props.passage.name, iAmTranslator)
        //onClick = { this.onClick.bind(this) }
        return (
            <div className={dropTargetCN} >
                <Progress percent={this.percent} height={8} color="lightblue" />
                <span
                    ref="dl" 
                    onDrop={this.handleFileDrop.bind(this)}
                    onDragOver={this.handleDragOver.bind(this)}
                    onDragLeave={this.handleDragLeave.bind(this)}>
                    <button className={buttonCN}
                        onClick={this.onClick} >{passage.name}</button>
                </span>

                {iAmTranslator && this.menu()}
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isHoveringOver && nextProps.isHoveringOver && this.showCommands) {
            this.showCommands = false
        }

        if (!nextProps.isHoveringOver && this.droptarget) {
            this.µ = false
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

    handleFileDrop(e) {
        let { project, passage } = this.props

        e.stopPropagation()
        e.preventDefault()

        if (!project.iAmTranslator) {
            displayError("Only admins or translators can upload videos to project.")
            return
        }
        
        let files = e.dataTransfer.files
        if (!files || files.length > 1 || !files[0].name.endsWith(".mp4")) {
            displayError("You must drop exactly one file and it must be a .mp4 file.")
            return
        }
        
        let file = files[0]
        console.log(`handleFileDrop name=${file.name}`)
        
        passage.uploadFile(file, 
            this.onprogress.bind(this), 
            (err) => {
                if (err) {
                    displayError(err)
                    return
                }

                setTimeout(() => { this.percent = 0 }, 2000)
                this.droptarget = false

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

    onprogress(event) {
        this.percent = 100 * (event.loaded / event.total)
    }

    handleDragOver(e) {
        e.stopPropagation()
        e.preventDefault()

        e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.

        this.droptarget = true
    }

    handleDragLeave(e) {
        e.stopPropagation()
        e.preventDefault()

        this.droptarget = false
    }

})

// CRASHING when I try to use MouseHoveringDetection
//export default MouseHoveringDetection(Passage)

export default Passage