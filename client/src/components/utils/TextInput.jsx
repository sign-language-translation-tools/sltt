import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {extendObservable} from 'mobx'
import PropTypes from 'prop-types'

const TextInput = observer(class TextInput extends Component {
    static propTypes = {
        message: PropTypes.string.isRequired,
        type: PropTypes.string,
        _onEnter: PropTypes.func.isRequired,
        _onEscape: PropTypes.func.isRequired,
        validate: PropTypes.func,  // check input value returns error message or ''
    }
    
    constructor(props) {
        super(props)

        extendObservable(this, {
            value: '',
            errorMessage: '',
        })
    }

    render() {
        let { message, type } = this.props
        let { value, errorMessage } = this

        type = type || 'text'

        return (
            <div>
                <input 
                    autoFocus
                    type={type}
                    value={value} 
                    onChange={this.onChange.bind(this)}
                    onKeyDown={this.onKeyDown.bind(this)} />

                { errorMessage && <div style={ {color: 'red'} } >{errorMessage}</div> }
                
                <div className="passage-info-text">
                     {value && !errorMessage && <span>{message}</span>}
                     {(errorMessage || !value) && <span>Type Esc to cancel.</span>}
                </div>
            </div>
        )
    }

    componentDidMount() { 
        this.value = this.props.initialValue
    }

    onChange(e) {
        let { validate } = this.props

        this.value = e.target.value
        this.errorMessage = (validate && validate(this.value)) || ''
    }

    onKeyDown(e) { 
        let { _onEnter, _onEscape } = this.props
        let { value, errorMessage } = this

        // <enter> = stop editing
        if (e.keyCode === 13) { 
            if (value && !errorMessage) {
                _onEnter && _onEnter(this.value)
                return
            }

            return 
        }

        // <esc> = abandon edit
        if (e.keyCode === 27) { 
            _onEscape && _onEscape()
            this.value = ''
            return 
        }
    }

})

export default TextInput