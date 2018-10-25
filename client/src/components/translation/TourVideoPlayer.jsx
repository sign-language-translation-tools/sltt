import React from 'react'
import PropTypes from 'prop-types'
//import { observer } from 'mobx-react'

const debug = require('debug')('sltt:PlayTourVideo') 

class TourVideoPlayer extends React.Component {
    static propTypes = {
        signedUrl: PropTypes.string.isRequired,
        onEnded: PropTypes.func,
    }

    render() {
        let { signedUrl, onEnded } = this.props
        if (!signedUrl) return null   // nothing to play

        debug(`render`)

        let style = {
            position: 'absolute',
            left: 10,
            top: 10,
            width: 1000,
            height: 750,
            zOrder: 100,
        }

        return (
            <div style={style}>
                <video w={1000} h={750}
                    controls
                    src={signedUrl}
                    onEnded={ () => onEnded && onEnded() }
                    autoPlay={true} />
            </div> 
        )
    }
}

export default TourVideoPlayer