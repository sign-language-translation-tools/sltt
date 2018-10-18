import React, { Component } from 'react'
import {observer} from 'mobx-react'
import {extendObservable} from 'mobx'
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc'
import PropTypes from 'prop-types'

import Passage from './Passage.jsx'
import TourPassage from './TourPassage.jsx'
import PassageAdder from './PassageAdder.jsx'
import TourPassageAdder from './TourPassageAdder.jsx'
import PortionSelector from './PortionSelector.jsx'

const DragHandle = SortableHandle(() => 
    <span className="passage-handle" 
        data-toggle="tooltip" 
        title="Drag to reorder.">
            <i className="fa fa-bars"></i>
    </span>)

const SortableItem = SortableElement(
    function ({ project, remote, passage, forceUpdate }) {
        return (
            <div className='passage'>
                <DragHandle />
                <Passage project={project}
                    remote={remote}
                    passage={passage} 
                    forceUpdate={forceUpdate} />
            </div>
        )
    }
)

const SortableList= SortableContainer(
    ({ project, remote, items, forceUpdate }) => {
        return (
            <div>
                { items.map((passage, index) => (
                    <SortableItem key={passage.name} 
                        index={index}
                        project={project}
                        remote={remote}
                        passage={passage}
                        forceUpdate={forceUpdate} />
                ))}
            </div>
        )
    }
)

const PassageList = observer(class PassageList extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        tourOpen: PropTypes.bool,      // true iff reacttour is in progress
    }
    
    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }

    render() {
        let { project, remote, tourOpen } = this.props
        let { portion } = project

        let items = (portion && portion.passages) || []
        /* eslint-disable no-unused-expressions */
        items.length // required to access length or list appears empty in view!!! why?

        if (tourOpen) return (
            <div className="passages">
                <PortionSelector project={project} />
                <TourPassage />
                <TourPassageAdder />
            </div>
        )

        return (
            <div className="passages">
                <PortionSelector project={project} />
                
                <SortableList 
                    project={project}
                    remote={remote}
                    items={items}
                    onSortEnd={this.onSortEnd.bind(this)}
                    forceUpdate={this.forceUpdate.bind(this)} />
                { portion &&
                    <PassageAdder 
                        project={project} 
                        forceUpdate={this.forceUpdate.bind(this)} />
                }
            </div>
        )
    }

    onSortEnd({oldIndex, newIndex}) {
        let { project } = this.props
        if (!project.iAmTranslator) return

        let { portion } = project

        portion.movePassage(portion.passages[oldIndex]._id, newIndex)
        this.forceUpdate()
    }

})

export default PassageList