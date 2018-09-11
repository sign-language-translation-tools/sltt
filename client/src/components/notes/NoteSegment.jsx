// Display a segment of a note so that the user can play
// or delete[last segment only]

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types' 
import NoteTextEditor from './NoteTextEditor.jsx'

class NoteSegment extends Component {
    static propTypes = {
        note: PropTypes.object.isRequired,
        segment: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }

    render() {
        let { segment } = this.props
        let { signedUrl, text, username } = segment
        console.log('render noteSegment', signedUrl)

        // We skip a bit at start of note video because otherwise the first recorded
        // segment in a session show up as all black in the previous since for some
        // reason its first frame is black.
        signedUrl += '#t=0.5'
        let created = this.localTime(segment.segmentCreated)
        username = username.split('@')[0]

        // In the following code the key=... on the video element is necessary to force
        // an update to the video when the signedUrl becomes available ...
        // without this you see no preview when a new video is created.

        return (
            <tr>
                <td className='note-play-cell'>
                    <div>
                        { !text && <a className='note-play-link' 
                             onClick={this.onClick.bind(this)} >
                                { created }
                            </a> }
                        { text && <span>{ created }</span> }
                    </div>
                    <div><i>{ username }</i></div>
                </td>
                <td className='note-content-cell'>
                    { !text && <video 
                            key={signedUrl}
                            width="50%" 
                            className="note-video"
                            preload="auto" 
                            onClick={this.onClick.bind(this)}>
                        <source src={signedUrl} type="video/webm" />
                      </video>
                    }
                    {text && <NoteTextEditor className="note-text-segment"
                        width="100%"
                        content={text} />
                    }
                </td>
                <td className='note-delete-button'>
                    { this.deleteable(segment) &&
                        <button 
                            type="button" 
                            className="note-delete-button btn" 
                            data-toggle="tooltip" 
                            title="Delete video."
                            onClick={this.deleteLastSegmentOfNote.bind(this)} >
                                <span aria-hidden="true">&times;</span>
                        </button>
                    }
                </td>
            </tr>
        )
    }

    onClick() {
        let { remote, segment } = this.props
        remote.playSignedUrl(segment.signedUrl)
    }

    localTime(created) {
        created = created.replace(' ', 'T')
        created = created.replace(/\./g, ':')
        let local = new Date(created).toString().substring(4, 21)
        return local
    }

    // You cannot delete the only segment in a note.
    // If a note has more than one segment you can delete the last one.
    // A note is a conversation so deleting something out of the middle does not make sense.
    deleteable(segment) {
        let { project, note } = this.props
        let { iAmConsultant } = project

        if (!iAmConsultant) return false  // you must be at least a consultant to remove a note segment
            
        let segments = note.segments || []
        let last = segments.length - 1

        if (last <= 0) return false
        return segments[last].segmentCreated === segment.segmentCreated
    }

    deleteLastSegmentOfNote() {
        let { segment, note } = this.props
        note.removeSegment(segment._id)
    }
}

export default observer(NoteSegment)