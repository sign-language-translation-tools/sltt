// Allow user to select which portion in the current project they wish to work with

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types' 
import _ from 'underscore'

class PortionSelector extends Component {
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
        let portions = (project.portions && project.portions.portions) || []
        let names = _.pluck(portions, 'name')

        let initial = (project.portion && project.portion.name) || ''

        return ( 
            <select className='custom-select portion-selector'
                            value={initial}
                            onChange={this.onChange.bind(this)}>
                { names.map(name => {
                    return (
                        <option key={name} value={name}> { name } </option>
                    )
                }) 
            }
            </select>
        )
    }

    onChange(event) {
        let name = event.target.value
            let { project } = this.props
            let portions = (project.portions && project.portions.portions) || []
            let portion = _.findWhere(portions, {name})
            if (portion)
                project.setPortion(portion)
    }

}

export default observer(PortionSelector)
