import React, { Component } from 'react'

// An non-interactive dummy version of PassageAdder for display during reacttour

class TourPassageAdder extends Component {
    render() {
        return (
                <span className="passage-adder" data-toggle="tooltip" title="Add new passage." >
                    <i className="fa fa-fw fa-plus-square-o"></i>
                </span>
            )
    }
}

export default TourPassageAdder