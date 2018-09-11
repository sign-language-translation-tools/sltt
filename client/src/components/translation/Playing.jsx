// TEST TEST used to explore reactivity

import React, { Component } from 'react'
import {observer} from 'mobx-react'
import {extendObservable} from 'mobx'
import PropTypes from 'prop-types' 

class Playing extends Component {
    static propTypes = {
        remote: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })
    }


    render() {
        let { remote } = this.props
        console.log('Playing render')

        return (<div> { (remote.playing && 'PLAYING') || 'not playing' }</div> )
    }

}

export default observer(Playing)