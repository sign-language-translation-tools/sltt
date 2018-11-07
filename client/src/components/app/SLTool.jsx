import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { Router, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import createHistory from 'history/createBrowserHistory'

import MembersEditor from '../members/MembersEditor.jsx'
import DatabaseEditor from './DatabaseEditor.jsx'
import ProjectsEditor from './ProjectsEditor.jsx'
import PortionsEditor from '../portions/PortionsEditor'
import ProjectsTabs from './ProjectsTabs.jsx'
//import HelpVideo from './HelpVideo'
//import Helps from './Helps'
import NavigationBar from './NavigationBar.jsx'
import './SLTool.css'
//import { displayError } from '../utils/Errors.jsx'
import { userProjects } from './UserProjects.js'
import { user } from '../auth/User.js'

export const history = createHistory()

// App component - represents the whole app
class SLTool extends Component {
    constructor(props) {
        super(props)

        let selected = localStorage.getItem('pageSelected') || 'translation'

        extendObservable(this, {
            selected,
            selectedTabIndex: 0,
        })
    }
    
    render() {
        let { projects, initialized } = userProjects
        let { selectedTabIndex, selected } = this

        let project = (projects.length  && projects[selectedTabIndex]) || null
        let iAmRoot = user.iAmRoot
        let selectPage = this.selectPage.bind(this)

        return (
            <div className="app-container">
                <Router history={history}>
                    <div>
                        <NavigationBar selected={selected} selectPage={selectPage} history={history} iAmRoot={iAmRoot} />

                        <Route exact={true} path="/"
                            render={props => (<ProjectsTabs 
                                projects={projects}
                                projectsInitialized={initialized}
                                selectedTabIndex={selectedTabIndex}
                                onTabSelection={this.onTabSelection.bind(this)}
                                />)}
                        />

                        <Route path="/portions"
                            render={props => <PortionsEditor
                                project={project} />} 
                        />

                        <Route path="/members"
                            render={props => <MembersEditor
                                project={project} />
                            } />

                        { iAmRoot && <Route path="/database"
                            render={props => <DatabaseEditor
                                project={project} />
                            } />
                        }
                        {iAmRoot && <Route path="/projects"
                            render={props => <ProjectsEditor
                                projects={projects} />
                            } />
                        }
                    </div>
                </Router>
                <ToastContainer
                    position="top-left"
                    type="default"
                    autoClose={5000}
                    hideProgressBar={true}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnHover
                />
            </div>
        )
    }

    selectPage(selection) {
        this.selected = selection
        localStorage.setItem('pageSelected', selection)
    }

    onTabSelection(index) {
        this.selectedTabIndex = index
    }

}

export default observer(SLTool)