import React, { Component } from 'react'
import _ from 'underscore'
import PropTypes from 'prop-types'
import {observer} from 'mobx-react'

import Member from './Member.jsx'
import MemberAdder from './MemberAdder.jsx'

class MembersEditor extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
    }

    // constructor(props) {
    //     super(props)
    //     let { project } = props
    // }

    render() {
        let { project } = this.props
        let { iAmAdmin, name, members } = project
        console.log(`MembersEditor render ${iAmAdmin}`)

        return (
            <div>
                <div className="container-fluid">
                    <div className="row">
                        <h3>Project Members ({ name })</h3>
                    </div>
                    <div className="row">
                        <div className="col-md-5">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { members.items.map((member, ind) => {
                                            return (
                                                <Member 
                                                    key={member.email}
                                                    member={member} 
                                                    project={project}
                                                    iAmAdmin={iAmAdmin}
                                                    isSoleAdmin={this.isSoleAdmin(member)} />
                                            )
                                        })
                                    }
                                    <MemberAdder iAmAdmin={iAmAdmin} project={project} />
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )
    }µ

    isSoleAdmin(member) {
        if (member.role !== 'admin') return false
        let { project } = this.props
        return _.where(project.members.items, { role: 'admin' }).length === 1
    }

}

export default observer(MembersEditor)