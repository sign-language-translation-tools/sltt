import React, { Component } from 'react'
//import _ from 'underscore'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
//import { extendObservable } from 'mobx'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'

import PortionView from './PortionView.jsx'
import PortionAdder from './PortionAdder'
import './Portion.css'
import { displayError } from '../utils/Errors.jsx'

const DragHandle = SortableHandle(() => 
    <span className="portion-handle"
                data-toggle="tooltip" 
                title="Drag to reorder.">
        <i className="fa fa-bars"></i></span>)

const SortableItem = SortableElement(({ item, iAmTranslator }) =>
    <div className="portion-item">
        <DragHandle />
        <PortionView item={item} iAmTranslator={iAmTranslator} />
    </div>
)

const SortableList = SortableContainer(({ items, iAmTranslator }) => {
    return (
        <div>
            { 
                items.map((item, index) => (
                    <SortableItem 
                        key={`item-${index}`} 
                        index={index} 
                        iAmTranslator={iAmTranslator}
                        item={item} />
                ))
            }
        </div>
    )
})

class PortionsEditor extends Component {
    static propTypes = {
        project: PropTypes.object,
    }

    render() {
        
        let { project } = this.props
        if (!project) return null
        let { portions, iAmTranslator } = project
        //console.log(`PortionsEditor render=${portions.portions.length}`)

        /* eslint-disable no-unused-expressions */
        portions.portions.length // necessary to force re-render, dont know why
        
        let projectName = project.name

        return (
            <div>
                <h3>Portions ({projectName})</h3>

                <SortableList 
                    items={portions.portions}
                    iAmTranslator={iAmTranslator}
                    useDragHandle={true}
                    onSortEnd={this.onSortEnd.bind(this)} />
                <PortionAdder 
                    portions={portions} 
                    iAmTranslator={iAmTranslator} />
            </div>
        )
    }

    onSortEnd({oldIndex, newIndex}) {
        let { project } = this.props
        let { portions } = project
        let portion = portions.portions[oldIndex]

        portions.movePortion(portion._id, newIndex, err => {
            if (err)
                displayError(err)
        })
    }

    shouldCancelStart(e) {
            // Cancel sorting if ...
            let tagName = e.target.tagName.toLowerCase()
            if (tagName === 'i') {
                    return true; // Return true to cancel sorting
            }
    }
}


export default observer(PortionsEditor)