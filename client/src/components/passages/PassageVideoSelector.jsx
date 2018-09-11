// Allow user to select which version of the video for the package

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types' 
import _ from 'underscore'
import { displayError } from '../utils/Errors.jsx'
import { DropdownButton, MenuItem } from 'react-bootstrap'

import PassageStatus from './PassageStatus.jsx'
//import {// } from '../../models/Passages.js'


class PassageVideoSelector extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }

    render() {
        let { project } = this.props
        let { passage, passageVideo } = project

        if (!passageVideo) return null
        let videos = passage.videosNotDeleted

        // Force a redraw when any changes to status
        _.map(passage.statuses, s => s.status)

        videos = _.sortBy(videos, '').reverse()

        return ( 
            <div className="passage-video-selector">
                <DropdownButton className="passage-video-selector-2" 
                                id={ 'passage-video-selector-' + project.name }
                                title={passageVideo.created} 
                                bsStyle="default" >
                    {videos.map(pv => {
                        return (
                            <MenuItem 
                                className="passage-video-selector-2" 
                                key={pv._id} 
                                onClick={() => this.onChange.bind(this)(pv)}
                                value={pv.created} > 
                                    {pv.created} &nbsp;
                                    <PassageStatus allowSingleStar={false} passageVideo={pv} />
                            </MenuItem>
                        )
                    }) 
                }
                </DropdownButton>
            </div>
        )
    }

    onChange(passageVideo) {
        let { project, remote } = this.props
        let { passage } = project
        if (!passage) return

        project.setPassageVideo(passage, passageVideo, err => {
            if (err) {
                displayError(err)
                return
            }
            remote.loadPassage(passage, passageVideo)
        })
    }

}

export default observer(PassageVideoSelector)
