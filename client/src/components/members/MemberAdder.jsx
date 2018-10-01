import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'
import { displayError } from '../utils/Errors.jsx'

class MemberAdder extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        iAmAdmin: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        extendObservable(this, {
            adding: false,
        })
    }

    render() {
        let { project, iAmAdmin } = this.props
        let { members } = project
        if (!iAmAdmin) return null

        if (!this.adding)
            return (
                <tr>
                    <td> <button className='add-user' onClick={() => {
                        this.adding = true
                    }}>Add User</button> </td>
                </tr>
            )

        return (
            <tr>
                <td>
                    <div className="passage-box">
                        <TextInput
                            type={'email'}
                            message="Type Enter to add new member or Esc to cancel."
                            initialValue=""
                            validate={members.canAdd}
                            _onEscape={() => { this.adding = false }}
                            _onEnter={this.onEnter.bind(this)} />
                    </div>
                </td>
            </tr>
        )
    }

    onEnter(email) {
        let { project } = this.props
        let { members } = project

        members.add(email, err => {
            if (err) {
                displayError(err)
            }
        })
        this.adding = false
    }

}

export default observer(MemberAdder)