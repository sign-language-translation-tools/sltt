import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { observer } from 'mobx-react'

import GoogleLogin from '../auth/GoogleLogin.jsx'
import { user } from '../auth/User.js'

class NavigationBar extends Component {
    static propTypes = {
        selectPage: PropTypes.func.isRequired,
        selected: PropTypes.string.isRequired,
        history: PropTypes.object.isRequired,
        allowDatabase: PropTypes.bool,
    }                        
    
    render() {
        let { selectPage, selected, history, allowDatabase } = this.props
        let { id_token } = user

        return (
            <nav className="navbar navbar-default app-navbar-bottom-margin">
                <div className="navbar-header">
                    <span className="navbar-brand">Sign Language Translation Tool</span>
                </div>

                {!id_token && 
                    <GoogleLogin />
                }

                {id_token && 
                    <div className="navbar-header pull-right app-selector-div">
                        <Link to="/" className="app-selector-icon video-camera-button">
                            <i
                                className={classNames("fa-video-camera", "fa", "fa-2x",
                                    { 'fa-border': selected === 'translation' })}
                                onClick={() => { selectPage('/') }}
                                data-toggle="tooltip"
                                title="Play/record video passages.">
                            </i>
                        </Link>

                        <Link to="/portions" className="app-selector-icon edit-portions-button">
                            <i
                                className={classNames("fa-bars", "fa", "fa-2x",
                                    { 'fa-border': selected === 'portions' })}
                                onClick={() => { selectPage('/portions') }}
                                data-toggle="tooltip"
                                title="Edit portions.">
                            </i>
                        </Link>

                        <Link to="/members" className="app-selector-icon">
                            <i
                                className={classNames("fa-user", "fa", "fa-2x", "edit-members-button",
                                    { 'fa-border': selected === 'members' })}
                                onClick={() => { selectPage('/members') }}
                                data-toggle="tooltip"
                                title="Edit project members.">
                            </i>
                        </Link>

                        <Link to="/" className="app-selector-icon">
                            <i
                                className={classNames("fa-sign-out", "fa", "fa-2x")}
                                onClick={() => { 
                                    user.logout.bind(user)() 
                                    history.replace('/')
                                }}
                                data-toggle="tooltip"
                                title="Log out.">
                            </i>
                        </Link>

                        { allowDatabase && <Link to="/database" className="app-selector-icon">
                            <i
                                className={classNames("fa-database", "fa", "fa-2x",
                                    { 'fa-border': selected === 'database' })}
                                onClick={() => { selectPage('/database') }}
                                data-toggle="tooltip"
                                title="Database Records.">
                            </i>
                            </Link> }

                        {/* <Link to="/helps" className="app-selector-icon">
                            <i
                                className={classNames("fa-question-circle", "fa", "fa-2x",
                                    { 'fa-border': selected === 'helps' })}
                                onClick={() => { selectPage('helps') }}
                                data-toggle="tooltip"
                                title="View project helps.">
                            </i>
                        </Link> */}
                    </div>
                }
            </nav>
        )
    }
}

export default observer(NavigationBar)
