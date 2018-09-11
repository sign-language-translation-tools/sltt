// Show a horizontal timeline with a vertical bar indicating current position in video.
// Allow user to set video position by clicking or dragging.

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'


class VideoPositionBar extends Component {

    constructor(props) {
        super(props)

        extendObservable(this, { 
        })

        this.defaultH = 30
        this.mousedown = false
    }

    render() {
        let { w, h, remote } = this.props
        h = h || this.defaultH

        // We must access currentTime in order to force a re-render whenever it changes
        // eslint-disable-next-line
        let { currentTime } = remote
        //console.log('vpb render', currentTime, remote.duration)

        return (
            <canvas 
                className="video-positionbar"
                width={w} 
                height={h}
                ref={ c => { this.canvas = c }} 
                onMouseUp={this.mouseup.bind(this)}
                onMouseDown={this._mousedown.bind(this)}
                onMouseMove={this.mousemove.bind(this)}>
            </canvas>
        )
    }

    setCurrentTime(x) {
        let { w, remote } = this.props
        let ct = (x * remote.duration) / w
        //console.log('setCurrentTime', ct)
        remote.setCurrentTime(ct)
    }

    // If I call this "mousedown" it never gets called! why?
    _mousedown(e) {
        let x = e.clientX - e.target.offsetLeft

        console.log("mousedown", x)
        this.setCurrentTime(x)
        this.mouseIsDown = true
    }

    mouseup(e) {
        //console.log("mouseup")
        this.mouseIsDown = false
    }

    mousemove(e) {
        //console.log("mousemove")
        if (this.mouseIsDown) { 
            let x = e.clientX - e.target.offsetLeft
            this.setCurrentTime(x)
        }
    }

    updateCanvas() {
        let { w, h, remote } = this.props
        let { currentTime, duration } = remote

        h = h || this.defaultH
        let m = h / 2

        let position = (currentTime / duration) * w

        const ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, w, h)
        ctx.beginPath()

        ctx.moveTo(0, m)
        ctx.lineTo(w, m)

        ctx.moveTo(position, m-3)
        ctx.lineTo(position, m+3)
        
        ctx.stroke()
    }

  componentDidMount() { this.updateCanvas() }

  componentDidUpdate() {this.updateCanvas() }

}

VideoPositionBar.propTypes = {
    w: PropTypes.number.isRequired,
    h: PropTypes.number,
    remote: PropTypes.object.isRequired,  // VideoRemote control object
}

export default observer(VideoPositionBar)
