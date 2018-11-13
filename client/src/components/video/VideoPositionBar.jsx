// Show a horizontal timeline with a vertical bar indicating current position in video.
// Allow user to set video position by clicking or dragging.

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import { AdjustCurrentTimeButtons } from '../utils/Buttons';


// make adjustment display optional


class VideoPositionBar extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number,
        passageVideo: PropTypes.object,   // PassageVideo (if one has been selected)
        remote: PropTypes.object.isRequired,  // VideoRemote control object
    }

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

        // We must access currentTime/duration in order to force a re-render whenever it changes
        // eslint-disable-next-line
        let { currentTime, duration, passageVideo } = remote
        // eslint-disable-next-line
        passageVideo && passageVideo.sortedSegments

        return (
            <div>
                <div className='sl-adjust-current-time'>
                    <AdjustCurrentTimeButtons
                        enabled={true}
                        adjustCurrentTime={this.adjustCurrentTime.bind(this)} />
                </div>
                <div>
                    <canvas 
                        className="video-positionbar"
                        width={w} 
                        height={h}
                        ref={ c => { this.canvas = c }} 
                        onMouseUp={this.mouseup.bind(this)}
                        onMouseDown={this._mousedown.bind(this)}
                        onMouseMove={this.mousemove.bind(this)}>
                    </canvas>
                </div>
            </div>
        )
    }

    adjustCurrentTime(delta) {
        let { remote } = this.props
        let { currentTime } = remote
        remote.setCurrentTime(currentTime + delta)
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
        let { w, h, remote, passageVideo } = this.props
        let { currentTime, duration } = remote
        //console.log('!!!', currentTime, duration)

        h = h || this.defaultH
        let m = h / 2

        const ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, w, h)
        ctx.beginPath()

        // Draw time line
        ctx.moveTo(0, m)
        ctx.lineTo(w, m)
        ctx.stroke()

        // Draw segment boundaries

        ctx.strokeStyle = 'lightblue'
        ctx.beginPath()
        let segments = (passageVideo && passageVideo.sortedSegments) || []

        segments.forEach(segment => {
            let position2 = (segment.position / duration) * w

            ctx.clearRect(position2-4, m-2, 8, 4)

            ctx.moveTo(position2, m - 10)
            ctx.lineTo(position2, m + 10)
        })

        ctx.lineWidth = 4
        ctx.stroke()

        // Draw current position cursor
        let position = (currentTime / duration) * w
        if (position < 1) position = 1  // if we draw cursor at origin we can only see half of it

        ctx.lineWidth = 2
        ctx.strokeStyle = 'black'
        ctx.beginPath()
        ctx.moveTo(position, m - 6)
        ctx.lineTo(position, m + 6)
        ctx.stroke()
    }

  componentDidMount() { this.updateCanvas() }

  componentDidUpdate() {this.updateCanvas() }

}

export default observer(VideoPositionBar)
