import React, { Component } from 'react'

import PropTypes from 'prop-types'
import MemberRole from './MemberRole.jsx'
import { displayError } from '../utils/Errors.jsx'

class Member extends Component {
    static propTypes = {
        member: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        iAmAdmin: PropTypes.bool.isRequired,
        isSoleAdmin: PropTypes.bool.isRequired,
    }

    //constructor(props) {
    //    super(props)
    //}

    onSetRole(role) { 
        let { member } = this.props
        
        member.setRole(role, err => {
            if (err)
                displayError(err)
        })
    }

    removeMember() { 
        let { member } = this.props

        member.delete(err => {
            if (err)
                displayError(err)
        })
    }

    render() {
        let { member, iAmAdmin, isSoleAdmin } = this.props

        return (
            <tr>
                <td> { member.email } </td>
                <td> <MemberRole 
                                role={member.role} 
                    _onChange={this.onSetRole.bind(this)}
                                isSoleAdmin={isSoleAdmin}
                                iAmAdmin={iAmAdmin} />
                </td>
                <td>
                    { iAmAdmin && !isSoleAdmin ?
                        <button
                            className="deleteuser"
                            data-toggle="tooltip" 
                            title="Remove this member from project."
                            onClick={this.removeMember.bind(this)}>X</button> : ''
                    }
                </td>
            </tr>
        )
    }

}

export default Member