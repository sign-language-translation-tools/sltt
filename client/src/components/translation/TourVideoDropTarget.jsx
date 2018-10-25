// Accept a drag/drop of an .mp4 file containing a SL description of this tour stop
// and upload it to the server.

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
//import className from 'classname'
import PropTypes from 'prop-types'

import { displayError } from '../utils/Errors.jsx'
import { uploadFile } from '../../models/API.js'
import VideoDropTarget from '../passages/VideoDropTarget.jsx'
import { getTourProject } from './TranslationEditorTour.jsx'

const debug = require('debug')('sltt:TourVideoDropTarget') 

class TourVideoDropTarget extends Component {
    static propTypes = {
        stepName: PropTypes.string.isRequired,
        ondone: PropTypes.func,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }

    render() {
        let {children} = this.props

        return (
            <div>
                <VideoDropTarget 
                    iAmTranslator={true} 
                    uploadFile={this.uploadTourStepVideo.bind(this)}>
                        {children}
                </VideoDropTarget>
            </div>
        )
    }

    uploadTourStepVideo = async function(file, onprogress, ondone) {
        try {
            let { stepName } = this.props
            debug(`uploadTourStepVideo ${stepName}, ${file.name}`)

            let _project = getTourProject()
            let db = _project.getDb()
            let _id = `TOURSTEP/${stepName}`
            let url = await uploadFile(file, _project.name, _id, onprogress)

            let doc = null
            await db.get(_id).then(_doc => doc = _doc).catch(() => { /* ok if doc does not exist yet */ })

            // If there is no doc for this tourstep in our database, then create one
            // to record the fact that there is a video present for this tour step
            if (!doc) {
                let doc = { _id, url }
                debug(`uploadTourStepVideo put`, doc)
                await _project.getDb().put(doc)
            }

            debug(`uploadTourStepVideo success`)
        } catch (err) {
            debug(`uploadTourStepVideo err=`, err)
            displayError(err)
        }

        ondone && ondone()
        this.props.ondone && this.props.ondone()
    }

}

export default observer(TourVideoDropTarget)