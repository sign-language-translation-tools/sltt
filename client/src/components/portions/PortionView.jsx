import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import PropTypes from 'prop-types'
import { getParent } from "mobx-state-tree"
import { displayError } from '../utils/Errors.jsx'

import PortionEditor from './PortionEditor'
// import PortionAdder from './PortionAdder'
import './Portion.css'

class PortionView extends Component {
    static propTypes = {
        item: PropTypes.object.isRequired,   // from project.portions.portions, types.model("Portion")
        iAmTranslator: PropTypes.bool.isRequired,
    }
    
    constructor(props) {
        super(props)

        extendObservable(this, { 
            mode: '',
            selected: false,
            showCommands: false,
        })
    }

    done() {
        this.mode = ''
    }

    editing() {
        this.mode = 'editing'
    }
    
    render() {
        let { item, iAmTranslator } = this.props

        if (this.mode === 'editing') 
            return ( <PortionEditor 
                                 item={item} 
                                 done={this.done.bind(this)} /> )

        return (
            <div className="portion-box">
                <div className="portion-name"
                     data-id={item.name} 
                     onDoubleClick={this.onRename.bind(this)}>
                     {item.name}
                </div>
                {iAmTranslator ? this.menu() : null}
            </div> 
        )
    }

    componentWillReceiveProps(nextProps) {
        //console.log("X", this.props.isHoveringOver, nextProps.isHoveringOver, this.showCommands)

        if (!this.props.isHoveringOver && nextProps.isHoveringOver && this.showCommands) {
            this.showCommands = false
        }
    }

    menu() {
        if (!this.props.iAmTranslator) { return null }
        
        if (!this.showCommands) {
            return ( 
                 <span className="portion-menu portion-show-commands"
                             href="#" 
                             data-toggle="tooltip" 
                             title="Click to see commands." 
                             onClick={this.onShowCommands.bind(this)}>
                        <i className="fa fa-toggle-right"></i>
                 </span>
            )
        }

        return (
            <div className="portion-menu">
                <span className="portion-button"
                        href="#" 
                        data-toggle="tooltip" 
                        title="Rename portion." 
                        onClick={this.onRename.bind(this)}>
                    <i className="fa fa-fw fa-pencil"></i>
                </span>
                <span className="portion-button"
                            href="#" 
                            data-toggle="tooltip" 
                            title="Delete portion."    
                            onClick={this.onDelete.bind(this)}>
                    <i className="fa fa-fw fa-trash"></i>
                </span>
            </div>
         )
    }

    onShowCommands(e) {
        e.preventDefault()
        this.showCommands = true
    }

    confirmDeletion(doDeletion) {
        let { item } = this.props
        
        // No need to confirm, if no video has been recorded yet
        if (!item.videod) { doDeletion(); return }

        confirmAlert({
                    title: 'Delete Video!?',    
                    message: 'Video has already been recorded for this portion.', 
                    confirmLabel: 'Delete video!',    
                    cancelLabel: 'Keep video.',    
                    onConfirm: doDeletion, 
                    onCancel: () => {}, 
                })
    }
    
    onDelete(e) { 
        e.preventDefault()
        let { item } = this.props

        this.confirmDeletion( () => {
            let portions = getParent(item, 2)
            portions.removePortion(item._id, err => {
                if (err)
                    displayError(err)
            })
        })
    }

    onRename(e) { 
        e.preventDefault()
        this.mode = 'editing'
    }

}


export default observer(PortionView)