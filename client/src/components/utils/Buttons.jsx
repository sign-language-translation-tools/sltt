import React from 'react'
import './Buttons.css'
import { MenuItem, Dropdown } from 'react-bootstrap'


function enable(cns, enabled) { return enabled ? cns : cns + ' sl-button-disabled' }
function enableImg(cns, enabled) { return enabled ? cns : cns + ' sl-image-button-disabled' }

export const PassageAddButton = function({enabled, onClick, tooltip}) {
    return (
        <span className={enable('sl-fa-button sl-passage-add-button fa-plus-square-o', enabled)}
            onClick={() => onClick && onClick()}
            data-toggle="tooltip" 
            title={tooltip} >
        </span>
    )
}

export const MembersViewButton = function({tooltip, onClick}) {
    return (
        <span className="sl-fa-button sl-members-view-button fa-user"
            onClick={() => onClick && onClick()}
            data-toggle="tooltip" 
            title={tooltip} >
        </span>
    )
}

export const PortionsViewButton = function({tooltip, onClick}) {
    return (
        <span className="sl-fa-button sl-portions-view-button fa-bars"
            onClick={() => onClick && onClick()}
            data-toggle="tooltip" 
            title={tooltip} >
        </span>
    )
}


export const RecordButton = function ({ enabled, onClick }) {
    //let className = classNames("et-right", "fa", "fa-2x", "fa-circle", "fa-fw", "text-danger", "video-up1", 
    let tooltip = "(Re)record passage. Click square Stop icon or type <space> to end."

    return (
        <img className={enableImg('sl-record-button', enabled)}
            alt={tooltip}
            src="toolbar/record.svg"
            onClick={() => enabled && onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip}
        />
    )
}

export const StopButton = function({enabled, onClick}) {
    let tooltip = "Stop recording. Shortcut: type <Ctrl>space."

    return (
        <span className={enable('sl-fa-button sl-stop-button fa-stop', enabled)}
            onClick={() => enabled && onClick && onClick()}
            data-toggle="tooltip" 
            title={tooltip} >
        </span>
    )
}

export const PlayButton = function ({ enabled, onClick }) {
    let tooltip = "Play (Ctrl+Space)."

    return (
        <img className={enableImg('sl-play-button', enabled)}
            alt={tooltip}
            src="toolbar/play.svg"
            onClick={() => enabled && onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip}
        />
    )
}

export const PauseButton = function ({ enabled, onClick }) {
    let tooltip = "Pause (Ctrl+Space)."

    return (
        <img className={enableImg('sl-pause-button', enabled)}
            alt={tooltip}
            src="toolbar/pause.svg"
            onClick={() => enabled && onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip}
        />
    )
}

//    color: ${props => props.enabled ? 'red' : 'lightgrey'};

export const CreateNoteButton = function ({ enabled, onClick }) {
    let tooltip = "Create note at current location."

    return (
        <span
            className={enable('sl-fa-button sl-create-note-button fa-comment', enabled)}
            onClick={() => enabled && onClick && onClick()}
            data-toggle="tooltip"
            title={tooltip} >
        </span>
    )
}

export const CreateLabelButton = function ({ enabled, onClick }) {
    let tooltip = "Create label in video at current location."

    return (
        <span>
            <span
                className={enable('sl-fa-button sl-create-label-button fa-tag', enabled)}
                onClick={() => enabled && onClick && onClick()}
                data-toggle="tooltip"
                title={tooltip} >
            </span>
            <Dropdown id="dropdown-select-label">
                <Dropdown.Toggle bsStyle="default" />
                <Dropdown.Menu>
                    <MenuItem eventKey="1">Luke 15.11-24</MenuItem>
                    <MenuItem eventKey="2">Luke 15.25-31</MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        </span>
    )
}

export const AdjustCurrentTimeButtons = function ({ enabled, adjustCurrentTime }) {
    return (
        <span>
            <img className={enableImg('sl-adjust-current-time-button', enabled)}
                src="toolbar/1SecLeftButton.gif"
                onClick={() => adjustCurrentTime(-1.0)}
                alt="go back 1 second"
                title="Go back 1 second" />

            <img className={enableImg('sl-adjust-current-time-button', enabled)}
                src="toolbar/PreviousButton.gif"
                onClick={() => adjustCurrentTime(-2.0/30.0)}
                alt="go back 1 frame"
                title="Go back 1 frame" />

            <img className={enableImg('sl-adjust-current-time-button', enabled)}
                src="toolbar/NextButton.gif"
                onClick={() => adjustCurrentTime(2.0/30.0)}
                alt="forward 1 frame"
                title="Go forward 1 frame" />

            <img className={enableImg('sl-adjust-current-time-button', enabled)}
                src="toolbar/1SecRightButton.gif"
                onClick={() => adjustCurrentTime(1.0)}
                alt="go forward 1 second"
                title="Go forward 1 second" />
        </span>
    )
}
