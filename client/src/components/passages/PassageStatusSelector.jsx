// Allow user to select which portion in the current project they wish to work with

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types' 
import _ from 'underscore'
import { DropdownButton, MenuItem } from 'react-bootstrap'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'

import { statuses, deletedStatus } from '../../models/PassagesStatus.js'

const trashIcon = statuses.slice(-1)[0]

const _statuses = [
    statuses[0],
    statuses[1],
    statuses[2],
    statuses[3],
    statuses[4],
    trashIcon,    // trash
]

class PassageStatusSelector extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        onDelete: PropTypes.func,
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

        // Add passage-status-selector-3 class to the trash icon so that we can adjust its display size
        let cn = s => { return 'passage-status-selector-2 ' + (s === trashIcon ? 'passage-status-selector-3' : '') }

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

    confirmDeletion(doDeletion) {
        confirmAlert({
            title: 'Delete Video!?',
            message: 'There is no easy way to get this video back if you delete it!',
            confirmLabel: 'Delete video!',
            cancelLabel: 'Keep video.',
            onConfirm: doDeletion,
            onCancel: () => { },
        })
    }

    onChange(s) {
        let { project, onDelete } = this.props
        let { passageVideo } = project
        if (!passageVideo) return

        let status = _.indexOf(statuses, s)

        //console.log('setStatus', status)

        if (status === deletedStatus) {
            this.confirmDeletion(() => {
                passageVideo.setStatus(status) 
                onDelete && onDelete()  
            })
        } else {
            passageVideo.setStatus(status)   
        }
    }

}

export default observer(PassageStatusSelector)
