import React, { Component } from 'react'
//import _ from 'underscore'
//import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'

import TextInput from '../utils/TextInput.jsx'
import { displayError } from '../utils/Errors.jsx'

// Edit name (rename) existing portion
// It must be a valid portion name and not create a duplicate portion name

const PortionEditor = observer(class PortionEditor extends Component {
  // constructor(props) {
  //   super(props)
  // }

  render() {
    let { 
      item /*from project.portions.portions, types.model("Portion") */,
      done } = this.props
    
    return (
      <div className="portion-box">
        <TextInput
          message="Type Enter to change name or Esc to cancel."
          initialValue={item.name}
          validate={this.validate.bind(this)}
          _onCancel={done}
          _onEnter={this.onEnter.bind(this)} />
      </div>
    )
  }

  onEnter(newName) { 
    let { item, done } = this.props
    item.rename(newName, err => {
      if (err) {
        displayError(err)
      }
      done()
    })
  }

  validate(newName) {
    let { item } = this.props
    return item.checkName(newName)
  }

})

PortionEditor.propTypes = {
  item: PropTypes.object.isRequired,
  done: PropTypes.func.isRequired,
}

export default PortionEditor