import React, { Component } from 'react'
// import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { PlayButton, RecordButton, PassageAddButton, MembersViewButton, PortionsViewButton } from '../utils/Buttons.jsx'

class VideoMessage extends Component {
    static propTypes = {
        project: PropTypes.object,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
    }

    render() {
        let { project } = this.props
        project = project || {}

        let { portion, passage, iAmTranslator } = project
        let videod = passage && passage.videos.length > 0

        if (passage && videod > 0) 
            return (
                <div className="video-message">
                    <ul><li>Click <PlayButton enabled={true} />&nbsp;above or type Ctrl-space to play passage.</li></ul>
                </div>
            )
        
        if (passage && iAmTranslator)
            return (
                <div className="video-message">
                    <ul><li>Click <RecordButton enabled={true} /> above to record passage.</li></ul>
                </div>
            )
        
        if (passage && !videod && !iAmTranslator)
            return (
                <div className="video-message">
                    <ul><li>No video available yet for this passage.</li></ul>
                </div>
            )
            
        // Our project model will always have a default portion selected if any portions are present
        if (!portion && !iAmTranslator)
            return (
                <div className="video-message">
                    <ul> <li>No portions available yet for this project</li></ul>
                </div>
            )
                
        if (!portion && iAmTranslator)
            return (
                <div className="video-message">
                    <ul>
                        <li>No portions present yet. You must create a least one portion before you can record a video passage. 
                            Click <PortionsViewButton enabled={true} /> on the top right to add a portion.</li>
                        { iAmTranslator && 
                            <li>Click <MembersViewButton enabled={true} /> on the top right to add users to this project. 
                            Users must login and create an account before they can be added to a project.</li>
                        }
                    </ul>
                </div>
            )
                    
        // At this point we have a portion selected
                        
        let passagesPresent = portion && portion.passages && portion.passages.length > 0
                    
        if (!passagesPresent && !iAmTranslator)
            return (
                <div className="video-message">
                    <ul><li>No passages available yet for this portion</li> </ul>
                </div>
        )
                        
        if (!passagesPresent && iAmTranslator)
            return (
                <div className="video-message">
                    <ul>
                        <li><strong>Portions</strong> are divided into <strong>passages</strong>.<br/>
                            Each passage is a single video.<br/>
                            At left, click <PassageAddButton enabled={true} /> to add a passage.</li>
                    </ul>
                </div>
            )
                            
        // At this point we have a portion with passages selected

        if (iAmTranslator)
            return (
                <div className="video-message">
                    <ul><li>At left, select a passage or click 
                        <PassageAddButton enabled={true} /> to add a passage.</li></ul>
                </div>
        )
                                
        return (
            <div className="video-message">
                <ul><li>At left, select a passage.</li></ul>
            </div>
        )
    }

}


export default observer(VideoMessage)
