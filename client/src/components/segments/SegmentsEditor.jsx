import React from 'react'
import PropTypes from 'prop-types'
import { extendObservable } from 'mobx'
import { observer, /* inject */ } from 'mobx-react'

// import { displayError } from '../utils/Errors.jsx'
import SegmentSelector from './SegmentSelector.jsx'
import SegmentLabels from './SegmentLabels.jsx'
import SegmentPosition from './SegmentPosition.jsx'
import SegmentDeleter from './SegmentDeleter.jsx'

// Display the currently selected segment and allow editin it.


class SegmentsEditor extends React.Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {
            editing: false
        })
    }


    render() {
        let { project, remote } = this.props
        let { iAmConsultant } = project
        let { segment } = remote

        return (
            <div className="passage-segments-editor">
                <SegmentSelector segment={segment} remote={remote} editing={this.editing} />
                <SegmentLabels 
                    segment={segment} 
                    iAmConsultant={iAmConsultant}
                    setEditing={ editing => this.editing = editing }
                    />
                <SegmentPosition 
                    segment={segment} 
                    iAmConsultant={iAmConsultant}
                    setEditing={ editing => this.editing = editing }
                    remote={remote} />
                <br/>
                <SegmentDeleter segment={segment} remote={remote} iAmConsultant={iAmConsultant} />
            </div>
        )
    }
}

export default observer(SegmentsEditor)