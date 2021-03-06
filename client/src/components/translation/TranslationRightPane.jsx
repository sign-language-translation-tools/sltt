import React from 'react'
import PropTypes from 'prop-types'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import SegmentsEditor from '../segments/SegmentsEditor.jsx'
import { PassageSegmentsIcon } from '../utils/Icons.jsx'

class TranslationRightPane extends React.Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        tourSelector: PropTypes.string,
    }

    render() {
        let { project, remote, tourSelector } = this.props

        // If I try to move the following to a .css file it stops working.
        // I have no idea why.
        let passageSegmentIconStyle = {
            verticalAlign: 'middle',
        }

        return (
            <Tabs>
                <TabList>
                    <Tab key='segments'>
                        <PassageSegmentsIcon 
                            className='sl-show-passage-sement'
                            enabled={true}
                            style={passageSegmentIconStyle}
                            tooltip="Show video segments in this passage." />
                    </Tab>
                </TabList>

                <TabPanel key='segments'>
                    <SegmentsEditor project={project} remote={remote} tourSelector={tourSelector} />
                </TabPanel>
            </Tabs>
        )
    }
}

export default TranslationRightPane