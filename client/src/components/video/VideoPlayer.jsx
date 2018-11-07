// On initial load this player plays remote.signedUrl.
// Component also responds to remote play, stop, and setCurrentTime events.
// The player keeps other components informed by updating at roughly the frame rate
//     - remote.currentTime 
//     - remote.playing

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
import InputSlider from 'react-input-slider'
import '../../../node_modules/react-input-slider/dist/input-slider.css'

import {} from "./Video.css"

class VideoPlayer extends Component {
    static propTypes = {
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired,
        remote: PropTypes.object.isRequired,  // VideoRemote control object
        closeWhenEnded: PropTypes.bool,
        //requestFullscreen: PropTypes.bool,
        autoPlay: PropTypes.bool,
    }

    constructor(props) {
        super(props)
        
        let { remote } = this.props

        extendObservable(this, { 
        })

        this.play = this.play.bind(this)
        this.stop = this.stop.bind(this)
        this.setCurrentTime = this.setCurrentTime.bind(this)
        this.onEnded = this.onEnded.bind(this)
        this.onPause = this.onPause.bind(this)
        this.onCanPlayThrough = this.onCanPlayThrough.bind(this)

        this.playListener = remote.addListener('play', this.play.bind(this))
        this.stopListener = remote.addListener('stop', this.stop.bind(this))
        this.setCurrentTimeListener = remote.addListener('setCurrentTime', this.setCurrentTime)
    }

    componentWillUnmount() {
        this.stopupdater()
        this.playListener.remove()
        this.stopListener.remove()
        this.setCurrentTimeListener.remove()
    }

    render() {
        let { remote, autoPlay } = this.props
        let { signedUrl } = remote
        let playbackRate = remote.playbackRate || 1.0
        let tooltip = `Speed = ${playbackRate.toFixed(1)}`

        //requestFullscreen && setTimeout(() => this.requestFullScreen(), 200)

        //console.log('VideoPlayer render', signedUrl.substring(0,30))

        return (
            <div className="video-player">
                <div className="video-player-video">
                    <video
                        className="video-player-video-video"
                        ref={(vc) => { this.vc = vc }}
                        src={signedUrl}
                        autoPlay={autoPlay}
                        onError={this.onError.bind(this)}
                        onEnded={this.onEnded.bind(this)}
                        onPause = { this.onPause.bind(this) }
                        onClick = { this.onClick.bind(this) }
                        onCanPlayThrough = { this.onCanPlayThrough } 
                    />
                </div>
                <div className="u-slider u-slider-y video-player-slider" slidertooltip={tooltip}>
                    <InputSlider
                        className="slider video-rate-input-slider"
                        axis="y"
                        y={2.0 - playbackRate}
                        ymax={2}
                        ystep={0.1}
                        onChange={this.rateChange}
                    />
                </div>
            </div>
        )

        // onAbort = {() => console.log('abort') }
        // onCanPlay = {() => console.log('canplay') }
        // onPause = {() => console.log('pause') }
        // onPlay = {() => console.log('play') }
        // onPlaying = {() => console.log('playing')}
        // onSuspend = {() => console.log('suspend')}
        // onWaiting = {() => console.log('waiting')}
        // onStalled = {() => console.log('stalled')}


    }

    rateChange = pos => {
        console.log(`rateChange ${pos.y}`)

        let { remote } = this.props
        let playbackRate = 2.0 - pos.y
        remote.playbackRate = playbackRate > 0.1 ? playbackRate : 0.1
    }

    logVideoState() {
        let { vc } = this

        console.log('logVideoState src', vc.src)
        console.log('error', vc.error) 
            // 1=MEDIA_ERR_ABORTED, 2=MEDIA_ERR_NETWORK, 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
        console.log('networkState', vc.networkState) 
            // 0=NETWORK_EMPTY, 1=NETWORK_IDLE, 2=NETWORK_LOADING, 3=NETWORK_NO_SOURCE
        console.log('readyState', vc.readyState) 
            // 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA

        console.log('currentTime', vc.currentTime)
        console.log('duration', vc.duration)
        console.log('paused', vc.paused)
        console.log('ended', vc.ended)
    }

    checkCloseWhenEnded() {
        let { remote, closeWhenEnded } = this.props
        if (closeWhenEnded) {
            remote.setSignedUrl(null)
        }
    }

    onError(e) {
        // Values for 'error' attribute of element and event
        // 1=MEDIA_ERR_ABORTED, 2=MEDIA_ERR_NETWORK, 3=MEDIA_ERR_DECODE, 4=MEDIA_ERR_SRC_NOT_SUPPORTED
        let { remote, signedUrl } = this.props
        remote.playing = false
        this.checkCloseWhenEnded()

        console.log('VideoPlayer onError', e.target.error.code)
        console.log('signedUrl', signedUrl)
    }

    onEnded() {
        //console.log('onEnded', vc.duration)

        this.cancelFullScreen()

        let { remote } = this.props
        remote.playing = false
        this.checkCloseWhenEnded()
    }

    onPause() {
        let { remote } = this.props
        remote.playing = false
    }

    onClick() {
        let { remote } = this.props
        if (remote.playing)
            this.stop()
        else
            this.play()       
    }

    onCanPlayThrough() {
        let { remote } = this.props
        let { vc } = this

        if (!remote.duration || (remote.duration <= 0.1 && vc.duration > remote.duration)) {
            //console.log('onCanPlayThrough', vc.duration, remote.duration)
            remote.duration = vc.duration
        }

        this.startupdater()
    }

    //------------------------------------------------------------------------
    // Triggered by events on VideoRemote: play, stop, setCurrentTime
    //------------------------------------------------------------------------

    requestFullScreen() {
        //console.log('!!!!requestFullScreen')

        if (!this.vc) {
            console.log('!!!! no vc')
            return
        }

        if (document.webkitFullscreenElement) {
            console.log('!!!! already full screen')
            return
        }
        
        this.vc.webkitRequestFullScreen()
    }

    cancelFullScreen() {
        if (document.webkitFullscreenElement) {
            //console.log('!!!!webkitCancelFullScreen')
            document.webkitCancelFullScreen()
        }
    }

    // startTime = null, means play from current position
    // endTime = null, means play through until end

    play(startTime, endTime) {
        let { remote } = this.props
        let { vc } = this

        if (remote.playing) this.stop()

        if (!isNaN(startTime)) {
            vc.currentTime = startTime
        }

        this.requestFullScreen()

        this.endTime = endTime

        let { playbackRate } = remote
        vc.playbackRate = playbackRate || 1.0

        this.startupdater()
        remote.playing = true
        //console.log('play!!!')
        this.vc.play()
    }

    stop()
    {
        let { remote } = this.props

        if (remote.playing) {
            this.stopupdater()
            remote.playing = false
            this.vc.pause()
        } 
    }

    // Invoked externally based on event
    setCurrentTime() {
        this.stop()
        let { remote } = this.props
        this.vc.currentTime = remote.currentTime
        //console.log('setCurrentTime', this.vc.currentTime, remote.currentTime)
    }

    timeupdate() {
        let { vc, endTime } = this
        let { remote } = this.props
        //console.log('timeupdate', vc.currentTime, vc.ended, vc.readyState)

        let playing = (vc.currentTime > 0 && !vc.paused && !vc.ended && vc.readyState > 2)

        if (vc.paused || vc.ended) this.stopupdater()

        if (remote.playing !== playing) remote.playing = playing

        let currentTime = vc.currentTime
        if (endTime && currentTime >= endTime) {
            this.stop()
            return
        }

        remote.currentTime = currentTime
    }

    // Currently the only way I know to reliably inform other components
    // what the current position of the player is is to set a timer
    // and report this based on the currentTime setting of the <video>.
    startupdater() {
        this.stopupdater()
        this.timerId = setInterval(this.timeupdate.bind(this), 333)
    }

    stopupdater() {
        if (this.timerId) { 
            clearInterval(this.timerId) 
            this.timerId = null
        }
    }

}

export default observer(VideoPlayer)
