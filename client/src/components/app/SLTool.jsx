import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { extendObservable } from 'mobx'
import { Router, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import createHistory from 'history/createBrowserHistory'

import MembersEditor from '../members/MembersEditor.jsx'
import DatabaseEditor from './DatabaseEditor.jsx'
import PortionsEditor from '../portions/PortionsEditor'
import ProjectsTabs from './ProjectsTabs.jsx'
//import HelpVideo from './HelpVideo'
//import Helps from './Helps'
import NavigationBar from './NavigationBar.jsx'
import Callback from '../auth/Callback.jsx'
import { user } from '../auth/Auth.js'
import { createAllMyProjects } from '../../models/Project.js'
import './SLTool.css'
import { displayError } from '../utils/Errors.jsx'

export const history = createHistory()

// App component - represents the whole app
class SLTool extends Component {
    constructor(props) {
        super(props)

        let selected = localStorage.getItem('pageSelected') || 'translation'

        user.restoreSession()

        extendObservable(this, {
            projects: [],
            projectsInitialized: false,
            selected,
            selectedTabIndex: 0,
        })

        this.initializeProjectCalled = false
    }
    
    componentDidMount() { this.initializeProjects() }

    componentWillUpdate() { this.initializeProjects() }

    initializeProjects() {
        if (!user.token || !user.username) return

        if (this.initializeProjectCalled) return
        this.initializeProjectCalled = true

        createAllMyProjects(user.username, (err, projects) => {
            this.projectsInitialized = true

            if (err) {
                displayError(err)
                return
            }

            this.projects = projects
        })
    }

    render() {
        let { projects, selectedTabIndex, selected, projectsInitialized } = this
        let { token, username } = user

        let allowDatabase = username === 'milesnlwork@gmail.com'

        //console.log(`SLTool render ${(token && 'loggedIn ') || ''}projects=${projects.length}`)

        let project = (projects.length  && projects[selectedTabIndex]) || null
        let selectPage = this.selectPage.bind(this)

        return (
            <div className="container">
                <Router history={history}>
                    <div>
                        <NavigationBar selected={selected} selectPage={selectPage} history={history} allowDatabase={allowDatabase} />

                        {/* Auth0 redirects us to this route after the user has logged in */}
                        <Route path="/callback" render={
                            (props) => {
                                user.handleAuthentication(props, err => {
                                    if (err) {
                                        displayError(err)
                                        return
                                    }

                                    this.projectsInitialized = false
                                    this.initializeProjects()
                                    
                                    history.replace('/')
                                })
                                return <Callback />
                            }
                        } />

                        <Route exact={true} path="/"
                            render={props => (<ProjectsTabs 
                                projects={projects}
                                token={token}
                                selectedTabIndex={selectedTabIndex}
                                onTabSelection={this.onTabSelection.bind(this)}
                                projectsInitialized={projectsInitialized}
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

                        { allowDatabase && <Route path="/database"
                            render={props => <DatabaseEditor
                                project={project} />
                            } />
                        }
                        {/* <Route path="/helps"
                            render={props => <Helps />} /> */}
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