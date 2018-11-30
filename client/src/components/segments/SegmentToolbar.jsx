// SegmentToolbar allows controlling playing and recording by means of actions
// and variable of remote (VideoRemote)

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'
//import { displayError } from '../utils/Errors.jsx'

import {PlayButton, PauseButton, RecordButton, StopButton } from '../utils/Buttons.jsx'
import '../utils/Buttons.css'

function enable(cns, enabled) { return enabled ? cns : cns + ' sl-button-disabled' }

function PlayBibleButton({onClick, enabled, tooltip}) {
    return (
        <span className={enable('sl-fa-button sl-play-bible-button fa-youtube-play', enabled)}
            onClick={() => onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip} >
        </span>
    )
}

function SelectBibleButton({ onClick, enabled, tooltip }) {
    return (
        <span className={enable('sl-fa-button sl-select-bible-button fa-caret-down', enabled)}
            onClick={() => onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip} >
        </span>
    )
}


function PlayPreviousDraftSegmentButton({ onClick, enabled, tooltip }) {
    let d = `M 0,0
             L 20,15
             L 0,30`

    return (
        <span className={enable('sl-play-previous-draft-segment-button', enabled)}
            onClick={() => onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip} >
            <svg className="sl-play-previous-draft-segment-svg" width="35" height="50" xmlns="http://www.w3.org/2000/svg">
                <g>
                    <path stroke="#337ab7"
                        d={d}
                        strokeWidth="1.5" fill="#337ab7" />
                    <text stroke="#337ab7" textAnchor="start" fontFamily="Helvetica, Arial, sans-serif"
                        fontSize="16" y="10" x="15" strokeWidth="0" fill="#337ab7">-1</text>
                </g>
            </svg >
        </span>
    )
}

function SelectPreviousDraftSegmentButton({ onClick, enabled, tooltip }) {
    return (
        <span className={enable('sl-fa-button sl-select-previous-draft-segment-button fa-caret-down', enabled)}
            onClick={() => onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip} >
        </span>
    )
}

class SegmentToolbar extends Component {
    static propTypes = {
        remote: PropTypes.object.isRequired,  // VideoRemote control object
        editing: PropTypes.bool.isRequired,
        iAmConsultant: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props)

        extendObservable(this, {  
        })

        this.defaultH = 60
    }
    
    render() {
        let pauseShown = false
        let stopShown = false
        let nop = () => {}

        return (
            <div className="segment-toolbar" >
                { !pauseShown &&
                    <PlayButton
                        className={'sl-play-button sl-play-segment-button'}
                        enabled={true}
                        onClick={nop}
                        title="Play segment. Shortcut: <Command>space." /> 
                }

                { pauseShown &&
                    <PauseButton
                        enabled={true}
                        onClick={nop}
                        title="Play segment. Shortcut: <Command>space." /> 
                }

                { !stopShown &&
                    <RecordButton
                        className={'sl-record-button sl-record-segment-button'}
                        enabled={true}
                        onClick={nop}
                        title="Record new version of this segment and patch it into passage." /> 
                }

                { stopShown &&
                    <StopButton
                        enabled={true}
                        onClick={nop}
                        title="Pause video. Shortcut: <Ctrl>space." /> 
                }

                <PlayBibleButton enabled={true} />
                <SelectBibleButton enabled={true} />

                <PlayPreviousDraftSegmentButton enabled={true} />
                <SelectPreviousDraftSegmentButton enabled={true} />
            </div> 
        )
    }
}

export default observer(SegmentToolbar)