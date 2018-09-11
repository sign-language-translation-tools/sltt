// Allow user to select which portion in the current project they wish to work with

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types' 
import _ from 'underscore'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { statuses, deletedStatus } from '../../models/Passages.js'

const _statuses = [
    statuses[0],
    statuses[1],
    statuses[2],
    statuses[3],
    statuses[4],
    statuses[10],    // trash
]

class PassageStatusSelector extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }

    render() {
        let { project } = this.props
        let { passageVideo, iAmConsultant } = project
        if (!passageVideo) return null

        let status = passageVideo.status

        let cn = s => { return 'passage-status-selector-2 ' + (s === statuses[10] ? 'passage-status-selector-3' : '') }

        return ( 
            <div className="passage-status-selector">
                <DropdownButton className="passage-status-selector-2" 
                                id={ 'passage-status-selector-' + project.name }
                                title={statuses[status]} 
                                bsStyle="default"
                                noCaret >
                    { iAmConsultant && _statuses.map(s => {
                        return (
                            <MenuItem 
                                className={cn(s)} 
                                key={s} 
                                onClick={() => this.onChange.bind(this)(s)}
                                value={s} > 
                                    {s} 
                            </MenuItem>
                        )
                    }) 
                }
                </DropdownButton>
            </div>
        )
    }

    onChange(s) {
        let { project } = this.props
        let { passage, passageVideo } = project
        if (!passageVideo) return

        let status = _.indexOf(statuses, s)

        console.log('setStatus', status)
        passageVideo.setStatus(status)   
        
        // If we are deleting this video, reset passage to force selecting
        // an undeleted video of this passage
        if (status === deletedStatus)
            project.setPassage(passage)
    }

}

export default observer(PassageStatusSelector)
