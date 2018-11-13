import React from 'react'

// Horizontal black line bisected by a vertical light blue line
// Refers to a segment of a video

export const PassageSegmentsIcon = function ({ tooltip, onClick, enabled, style }) {
    let verticalColor, horizontalColor
    if (enabled) {
        verticalColor = 'lightblue'
        horizontalColor = 'black'
    } else {
        verticalColor = 'lightgrey'
        horizontalColor = 'grey'
    }

    return (
        <span 
                onClick={() => onClick && onClick()}
                data-toggle="tooltip"
                title={tooltip} >
            <svg style={style}
                    width="24" 
                    height="25" 
                    xmlns="http://www.w3.org/2000/svg">
                <g> 
                    <line x1="0" y1="13" x2="8" y2="13" stroke={horizontalColor} strokeWidth="2" />
                    <line x1="16" y1="13" x2="24" y2="13" stroke={horizontalColor} strokeWidth="2" />
                    <line x1="12" y1="0" x2="12" y2="25" stroke={verticalColor} strokeWidth="4" />
                </g>
            </svg>
        </span>
    )
}

