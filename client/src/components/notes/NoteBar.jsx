// Display location of notes in this chunk.
// Allow user to click them -> 'noteclicked' event

import React, { Component } from 'react'
import {extendObservable} from 'mobx'
import {observer} from 'mobx-react'
import PropTypes from 'prop-types'



const NoteBar = observer(class NoteBar extends Component {
    static propTypes = {
        project: PropTypes.object.isRequired,
        remote: PropTypes.object.isRequired,
        w: PropTypes.number.isRequired,
    }

    // In Passage notes must be in ascending order by position in order to render correctly

    constructor(props) {
        super(props)

        extendObservable(this, { 
            summary: "",
        })

        this.h = this.props.h || 30
        this.radius = 7.5
        this.drawable = []  // [ {x: number, n: PassageNote} ]
    }

    render() {
        let { project, remote, w } = this.props
        let { passage } = project

        if (!passage) return null
        // console.log('NoteBar render', passage.notes.length, remote.duration)

        this.createDrawable(passage.notes, remote.duration, w)

        return (
            <div>
                <canvas 
                    className="note-bar"
                    width={this.props.w} 
                    height={this.h}
                    onClick={this.noteClicked.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}
                    onMouseLeave={this.mouseLeave.bind(this)}
                    ref={ c => { this.canvas = c }} />
                <p>{this.summary}</p>
            </div>
        )
    }

    createDrawable(notes, duration, w) {
        let { radius } = this

        this.drawable = []
        let xMin = radius

        for (var n of notes) {
            if (n.resolved) continue
            let x = w * (n.position / duration)

            if (x < xMin) { x = xMin }    // don't overlap with previous dot
            xMin = x + 2 * radius     // don't let next dot overlap

            this.drawable.push( {x, n} )
        }

        //console.log('createDrawable', this.drawable)
    }

    updateCanvas() {
        let { drawable, canvas } = this
        if (!drawable || !canvas) return
        let { w } = this.props

        const ctx = canvas.getContext('2d')

        let h = this.h
        let m = h / 2
        let radius = this.radius

        ctx.clearRect(0, 0, w, h)

        ctx.beginPath()

        for (let dr of drawable)
        {
            ctx.arc(dr.x, m, radius, 0, 2 * Math.PI, false)
        }

        ctx.fillStyle = 'green'
        ctx.fill()    
    }

    componentDidMount() { this.updateCanvas() }

    componentDidUpdate() { this.updateCanvas() }

    mouseMove(e) {
        let note = this.findNote(e.clientX)
        if (!note || !note.segments || !note.segments.length) { 
            this.summary = ""; 
            return 
        }

        let seg = note.segments[0]
        let ts = new Date(seg.created).toString().substring(0, 21)
        this.summary = seg.userName + "\xA0\xA0\xA0\xA0\xA0" + ts
    }

    mouseLeave(e) {
        this.summary = ""
    }

    noteClicked(e) {
        let { project } = this.props

        let x = e.clientX - e.target.offsetLeft
        let note = this.findNote(x)

        if (note) {
            project.setNote(note)
        }
    }

    findNote(x) {
        let { drawable } = this
        if (!drawable) return

        let radius = this.radius

        for (let dr of drawable) {
            if (x >= dr.x - radius && x <= dr.x + radius) {
                return dr.n
            }
        }

        return null
    }

})

export default NoteBar
