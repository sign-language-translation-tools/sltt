import React, { Component } from 'react'
import PropTypes from 'prop-types'

/*
display in top right
make background transparent
display based on x/y
try in all 4 corners
 */

//const log = require('debug')('sltt:DisplayLabel') 

class DisplayLabel extends Component {
    static propTypes = {
        label: PropTypes.object.isRequired,
    }

    render() {
        let { label } = this.props
        let { x, y, text } = label

        let left, textAlign

        if (x > 50) {
            left = `${x-30}%`
            textAlign = 'right'
        } else {
            left = `${x}%`
            textAlign = 'left'
        }

        let style = {
            fontSize: '125%',
            position: 'absolute',
            left,
            top: `${y}%`,
            width: '30%',
            textAlign,
            zOrder: 100,
        }

        return(<div style={style}>{text}</div>)
    }

}

export default DisplayLabel
