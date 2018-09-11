import React, { Component } from 'react'
import { extendObservable } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'
import { displayError } from '../utils/Errors.jsx'

class PortionAdder extends Component {
    static propTypes = {
        portions: PropTypes.object.isRequired,
        iAmTranslator: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);

        extendObservable(this, { 
            adding: false,
        })
    }

    render() {
        let { portions, iAmTranslator } = this.props
        let items = portions.portions

        if (items.length === 0 && !iAmTranslator) {
            return (<p>No portions present yet for this project</p>)
        }
     
        if (!iAmTranslator) return null

        if (!this.adding)
            return (
                <span>
                    { items.length === 0 &&
                        <span><strong>Projects</strong> are divided into <strong>portions</strong>.<br/><br/> 
                                    Typically a portion will contain all the passages in a single user video.<br/><br/>
                                    For example, a portion might be called 'Mark 1'.<br/><br/>
                                    Click the plus sign below to add a portion to this project.<br/><br/></span>
                    }
                    <span onClick={ () => { this.adding = true; this.name = '' } }
                                data-toggle="tooltip" 
                                title="Add portion.">
                        <i className="fa fa-fw fa-plus-square-o portion-add-button"></i>
                    </span>
                </span>
            )

        return (
            <div className="passage-box">
                <TextInput
                    message="Type Enter to add new portion or Esc to cancel."
                    initialValue=""
                    validate={this.validate.bind(this)}
                    _onCancel={this.onCancel.bind(this)}
                    _onEnter={this.onEnter.bind(this)} />
            </div>
        )
    }

    onCancel() { 
        this.adding = false
    }

    onEnter(newPortionName) { 
        let { portions } = this.props
        portions.addPortion(newPortionName, err => {
            if (err) {
                displayError(err)
            }
        })
        this.adding = false
    }

    validate(newPortionName) {
        let { portions } = this.props
        return portions.checkName(newPortionName)
    }

}

export default observer(PortionAdder)