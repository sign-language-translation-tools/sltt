import React, { Component } from 'react'
import './Passage.css'

class TourPassage extends Component {
    render() {
        let buttonCN = "btn passage-button passage-selected passage-video-present"

        return (
            <div className="passage-box" >
                <span className="passage-handle tour-passage-handle"
                    data-toggle="tooltip"
                    title="Drag to reorder.">
                    <i className="fa fa-bars"></i>
                </span>
                <span>
                    <button className={buttonCN}> John 3.11-15 </button>
                </span>
                <span className="passage-delete-button"
                    href="#"
                    data-toggle="tooltip"
                    title="Delete passage.">
                    <i className="fa fa-fw fa-trash"></i>
                </span >
            </div>
        )
    }
}

export default TourPassage