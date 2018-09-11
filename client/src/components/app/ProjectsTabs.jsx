import React from 'react'
import PropTypes from 'prop-types'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'

import TranslationEditor from '../translation/TranslationEditor.jsx'
import NotAMember from './NotAMember.jsx'


class ProjectTabs extends React.Component {
    static propTypes = {
        projects: PropTypes.object.isRequired,
        selectedTabIndex: PropTypes.number.isRequired,
        onTabSelection: PropTypes.func.isRequired,
        token: PropTypes.string,
        projectsInitialized: PropTypes.bool.isRequired,
    }

    render() {
        let { projects, selectedTabIndex, token, projectsInitialized } = this.props

        if (!token || !projectsInitialized) return null

        if (projects.length === 0) return ( <NotAMember /> )

        return (
            <Tabs onSelect={this.onSelect.bind(this)}
                  selectedIndex={selectedTabIndex} >
                <TabList>
                    { projects.map(project => ( <Tab key={project.name}>{project.name}</Tab> )) }
                </TabList>

                { projects.map(project => (
                        <TabPanel key={project.name}>
                            <TranslationEditor project={project} />
                        </TabPanel>
                    ))
                }
            </Tabs>
        )
    }

    onSelect(index, lastIndex) {
        this.props.onTabSelection(index)
        return false    // we will rerender when we get new selectedTabIndex
    }

}

export default ProjectTabs