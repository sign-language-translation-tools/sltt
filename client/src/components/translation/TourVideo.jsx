// Display hands icon which allows user to play a SL video describing this tour stop.

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'

import { PlayTourStepButton } from '../utils/Buttons.jsx'
import TourVideoDropTarget from './TourVideoDropTarget.jsx'
import { getTourProject } from './TranslationEditorTour.jsx'
import { getUrl } from '../../models/API.js'

const debug = require('debug')('sltt:TourVideo') 


class TourVideo extends Component {
    static propTypes = {
        stepName: PropTypes.string.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            signedUrl: '',   // URL for SL video for this tour stop
        })
    }

    componentDidMount() {
        this.getSignedUrl(this.props)
    }

    componentWillUpdate(newProps) {
        this.getSignedUrl(newProps)
    }

    getSignedUrl = async function (props) {
        let { stepName } = props
        debug(`getSignedUrl stepName=${stepName}`)

        let project = getTourProject()
        let db = project.getDb()
        let _id = `TOURSTEP/${stepName}`

        let doc
        try {
            doc = await db.get(_id)
            this.signedUrl = await getUrl(project.name, doc.url)
        } catch (error) {
            // ignore fetch error, no video yet to play
            this.signedUrl = ''
        }
        
        debug(`signedUrl=${this.signedUrl}`)
    }

    render() {
        let { stepName } = this.props
        let { signedUrl } = this

        return (
            <TourVideoDropTarget stepName={stepName} ondone={ () =>  this.getSignedUrl(this.props) } >
                <PlayTourStepButton enabled={signedUrl.length > 0} 
                    onClick={this.playVideo.bind(this)} />
            </TourVideoDropTarget>
        )
    }

    playVideo() {
        let project = getTourProject()
        project.setVideoTourSignedUrl(this.signedUrl)
    }

}

export default observer(TourVideo)
