import React, { Component } from 'react'
import {observer} from 'mobx-react'
import {extendObservable} from 'mobx'
import PropTypes from 'prop-types' 

//import Playing from './Playing.jsx'
import PassageList from '../passages/PassageList.jsx'
import VideoMain from '../video/VideoMain.jsx'
import VideoRemote from '../video/VideoRemote.js'
import NoteDialog from '../notes/NoteDialog.jsx'
import './Translation.css'
import '../video/Video.css'
import '../notes/Note.css'

class TranslationEditor extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
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

        // If there is no longer a passage or a passageVideo selected make sure
        // that the video control is not displaying a video
        if (!project.passage || !project.passageVideo) {
            remote.clearPassage()
        }
    }

    render() {
        let { project } = this.props
        // eslint-disable-next-line
        let { note, passage, passageVideo } = project
        let { remote } = this

        //console.log('render TranslationEditor')
        
        return (
            <div ref={c => { this.topDiv = c }}>
                { note && <NoteDialog project={project} /> } 

                <div className="translation-top-container">
                    <div className="translation-fixedpane">
                        <PassageList project={project} remote={remote} />
                    </div>

                    <div className="translation-flexiblepane">
                        <VideoMain 
                            remote={remote}
                            project={project}
                            w={640} 
                            h={380} />
                        
                    </div>
                </div>

            </div>
        )
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