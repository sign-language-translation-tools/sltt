import React, { Component } from 'react'
import {observer} from 'mobx-react'
import {extendObservable} from 'mobx'
import PropTypes from 'prop-types' 
import Tour from 'reactour'

//import Playing from './Playing.jsx'
import PassageList from '../passages/PassageList.jsx'
import VideoMain from '../video/VideoMain.jsx'
import VideoRemote from '../video/VideoRemote.js'
import NoteDialog from '../notes/NoteDialog.jsx'
import './Translation.css'
import '../video/Video.css'
import '../notes/Note.css'
import { tourSteps, setTourProject } from './TranslationEditorTour.jsx'
import TourVideoPlayer from './TourVideoPlayer.jsx'

// eslint-disable-next-line
const debug = require('debug')('sltt:TranslationEditor') 


class TranslationEditor extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
            tourOpen: false
        })

        let { project } = this.props

        let remote = new VideoRemote()
        remote.allowRecord = project.iAmTranslator
        remote.allowCreateNote = project.iAmConsultant

        this.remote = remote

        remote.loadPassage(project.passage)
    }

    componentWillUpdate() {
        let { project } = this.props
        let { remote } = this
        this.startAt = 0

        // If there is no longer a passage or a passageVideo selected make sure
        // that the video control is not displaying a video
        if (!project.passage || !project.passageVideo) {
            remote.clearPassage()
        }
    }

    render() {
        let { project } = this.props
        // eslint-disable-next-line
        let { note, videoTourSignedUrl } = project
        let { remote, tourOpen } = this

        return (
            <div ref={c => { this.topDiv = c }}>
                { note && <NoteDialog project={project} /> } 

                <div className="translation-top-container">
                    <div className="translation-fixedpane">
                        <PassageList project={project} remote={remote} tourOpen={tourOpen} />
                    </div>

                    <div className="translation-flexiblepane">
                        <VideoMain 
                            remote={remote}
                            project={project}
                            openTour={() => {
                                setTourProject(project)
                                this.tourOpen = true
                            }}
                            tourOpen={tourOpen}
                            w={640} 
                            h={380} />
                        
                    </div>
                </div>
                <Tour
                    steps={tourSteps}
                    maskClassName="tour-mask"
                    isOpen={tourOpen}
                    showNavigation={false}
                    onRequestClose={this.onCloseTour.bind(this)} />
                <TourVideoPlayer
                    signedUrl={videoTourSignedUrl}
                    onEnded= { () => project.setVideoTourSignedUrl('') } />
            </div>
        )
    }

    onCloseTour() {
        this.tourOpen = false
    }

    preventDrop(e) {
        if (!e) return

        e.preventDefault()
        e.dataTransfer.effectAllowed = "none"
        e.dataTransfer.dropEffect = "none"
    }

    componentDidMount() { 
        // window.addEventListener('keydown', this.keydown.bind(this))
        this.topDiv.addEventListener('dragover', this.preventDrop, false)
        this.topDiv.addEventListener('drop', this.preventDrop, false)
    }

}

export default observer(TranslationEditor)