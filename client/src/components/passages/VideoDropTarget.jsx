// Accept dropped video files and upload them

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import className from 'classname'
import Progress from 'react-progress'
import PropTypes from 'prop-types'

import './Passage.css'
import { displayError } from '../utils/Errors.jsx'

const debug = require('debug')('sltt:VideoDropTarget') 


class VideoDropTarget extends Component {
    static propTypes = {
        iAmTranslator: PropTypes.bool.isRequired,
        uploadFile: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
            percent: 0, 
            droptarget: false,
        })
    }

    render() {
        let { children } = this.props
        let CN = className({ "passage-active-droptarget": this.droptarget })

        return (
            <div className={CN} >
                <Progress percent={this.percent} height={8} color="lightblue" />
                <span
                    ref="dl" 
                    onDrop={this.handleFileDrop.bind(this)}
                    onDragOver={this.handleDragOver.bind(this)}
                    onDragLeave={this.handleDragLeave.bind(this)}>
                        {children}
                </span>
            </div>
        )
    }

    handleFileDrop(e) {
        let { iAmTranslator, uploadFile } = this.props

        e.stopPropagation()
        e.preventDefault()

        if (!iAmTranslator) {
            displayError("Only admins or translators can upload videos to project.")
            return
        }
        
        let files = e.dataTransfer.files
        if (!files || files.length > 1) {
            displayError("You must drop exactly one file.")
            return
        }
        let file = files[0]
        
        if (!file.name.endsWith(".mp4") && !file.name.endsWith(".webm")) {
            displayError("File must be a .mp4 or .webm file.")
            return
        }

        debug(`handleFileDrop name=${file.name}`)
        
        uploadFile(file, this.onprogress.bind(this), this.ondone.bind(this)) 
    }

    ondone() {
        debug(`ondone`)
        setTimeout(() => { this.percent = 0 }, 2000)
        this.droptarget = false
    }

    onprogress(event) {
        debug(`onprogress ${event.loaded}`)
        this.percent = 100 * (event.loaded / event.total)
    }

    handleDragOver(e) {
        //debug(`handleDragOver`)

        e.stopPropagation()
        e.preventDefault()

        e.dataTransfer.dropEffect = 'copy' // Explicitly show this is a copy.

        this.droptarget = true
    }

    handleDragLeave(e) {
        //debug(`handleDragLeave`)

        e.stopPropagation()
        e.preventDefault()

        this.droptarget = false
    }

}

// CRASHED when I try to use MouseHoveringDetection
//export default MouseHoveringDetection(Passage)

export default observer(VideoDropTarget)