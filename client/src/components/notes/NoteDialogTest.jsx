// This component is used to exercise VideoMain and its subcomponents

import React, { Component } from 'react'
import PouchDB from 'pouchdb'
import PouchDBAdapterMemory from 'pouchdb-adapter-memory'

import NoteDialog from './NoteDialog.jsx'
import { Portions } from '../../models/Portions.js'
import { Project } from '../../models/Project.js'
import { user } from '../auth/Auth.js'


// Create in-memory test DB
PouchDB.plugin(PouchDBAdapterMemory)
let dbName = 'DB' + Math.random().toString(8)
let _test1 = new PouchDB(dbName, { adapter: 'memory' })

let project = Project.create({ 
    name: 'ASLVtest',
    iAmTranslator: true,
})

let portions = Portions.create({ portions: [] })
project.setPortions(portions)

portions.setDb(_test1)

async function initialize() {
    let err1 = await new Promise(resolve => portions.addPortion('Matthew', resolve))
    if (err1) throw new Error(err1)

    let portion = portions.portions[0]
    let err2 = await new Promise(resolve => portion.addPassage('Mat 1.1-5', resolve))
    if (err2) throw new Error(err2)

    let passage = portion.passages[0]
    let note = {
        videoCreated: '2018-07-01 00.00.00',
        noteCreated: '2018-08-01 00.00.00',
        position: 1.0,
        segments: [],
        resolved: false,
    }
    passage.pushNote(note)
    if (passage.notes.length !== 1) throw new Error('initialize failed')

    let _note = passage.notes[0]
    _note.addSegment({
        _id: "Matthew/Mat 1.1-5/2018-07-01 00.00.00/2018-08-01 00.00.00/2018-04-16 22.56.24/notesegment",
        duration: 3.765,
        noteCreated: "2018-08-01 00.00.00",
        position: 1,
        segmentCreated: "2018-04-16 22.56.24",
        url: "https://ubs-signlanguage-upload.s3.amazonaws.com/ASLVtest/Matthew/Mat_1.1-5/2018-07-01_00.00.00.2018-08-01_00.00.00.2018-04-16_22.56.24.webm",
        tag: "notesegment",
        username: "milesnlwork@gmail.com",
        videoCreated: "2018-07-01 00.00.00",
    })

    project.setPassage(passage)
    project.setPortion(portion)
    project.setNote(passage.notes[0])
}

initialize()


class NoteDialogTest extends Component {
    render() {
        if (!user.token) return null

        return (
            <NoteDialog project={project} />
        )
    }

}

export default NoteDialogTest
