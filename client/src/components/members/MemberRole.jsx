import React, { Component } from 'react'
import PropTypes from 'prop-types'


class MemberRole extends Component {
    static propTypes = {
        _onChange: PropTypes.func.isRequired,
        iAmAdmin: PropTypes.bool.isRequired,
        isSoleAdmin: PropTypes.bool.isRequired,
        role: PropTypes.string.isRequired,
    }

    // constructor(props) {
    //     super(props)
    // }

    render() {
        let { iAmAdmin, isSoleAdmin, role } = this.props
        if (iAmAdmin && !isSoleAdmin) {
            return (
                <select value={role} onChange={this.onChange.bind(this)}>
                    <option title="Admins are allowed to do all operations.">admin</option>
                    <option title="Translators can add and record passages and notes.">translator</option>
                    <option title="Consultants can view passages and record notes.">consultant</option>
                    <option title="Observers can view passages and notes. They cannot record anything.">observer</option>
                </select>

            )
        } else {
            return ( <span> {role} </span> )
        }
    }

    onChange(e) {
        let { _onChange } = this.props

        let value = e.target.value
        _onChange(value)
    }
}

export default MemberRole