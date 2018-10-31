// Test Passages, Passage, PassageVideo, PassageNote, PassageNoteSegment models.
// Users in memory DB and should not access server.

import _ from 'underscore'
import PouchDB from 'pouchdb'

// Create an in-memory test DB.
// Exercise the model functions∫ relating to passages.

import { Project } from './Project.js'
import { Portions, Portion } from './Portions.js'
import { Passages, Passage, PassageVideo, PassageNote, PassageNoteSegment } from './Passages.js'

require('../components/auth/User.js').user.setupTestUser()

// Create in-memory test DB
PouchDB.plugin(require('pouchdb-adapter-memory'))
let dbName = 'DB' + Math.random().toString(8)
let _test1 = new PouchDB(dbName, { adapter: 'memory' })

let portions, portion, passage

const project = Project.create({ name: 'ASLVtest' })


it("Can create empty Portions/portion/passage", (done) => {
    portions = Portions.create({ portions: [] })
    project.setPortions(portions)

    portions.setDb(_test1)

    portions.addPortion('Matthew', err => {
        expect(err).toBeFalsy()
        portion = portions.portions[0]

        portion.addPassage('Mat 1.1-5', err => {
            expect(err).toBeFalsy()
            passage = portion.passages[0] 

            portion.addPassage('Mat 1.6-8', err => {
                expect(err).toBeFalsy()
                done()
            })
        })
    })
})

it("Can add video", (done) => {
    let doc = {
        _id: 'Matthew/Mat 1.6-8/2018-01-01 00.00.00.webm/video',
        username: 'milesnlwork@gmail.com',
        videoCreated: '2018-01-01 00.00.00',
        url: 'Matthew/Mat 1.6-8/2018-01-01 00.00.00.webm',
        duration: 33.0,
    }

    passage.addVideo(doc, err => {
        if (err) throw new Error(err)
        expect(passage.videos.length).toBe(1)
        done()
    })
    
})

it("Can add video version 2", (done) => {
    let doc = {
        _id: 'Matthew/Mat 1.6-8/2018-01-02 00.00.00.webm/video',
        username: 'milesnlwork@gmail.com',
        videoCreated: '2018-01-02 00.00.00',
        url: 'Matthew/Mat 1.6-8/2018-01-02 00.00.00.webm',
        duration: 40.0,
    }

    passage.addVideo(doc, err => {
        if (err) throw new Error(err)
        expect(passage.videos.length).toBe(2)
        done()
    })

})

it("Can set status", (done) => {
    passage.setStatus(passage.videos[0], 2, err => {
        if (err) throw new Error(err)
        expect(passage.videos[0].status).toBe(2)

        passage.setStatus(passage.videos[1], 3, err => {
            if (err) throw new Error(err)
            expect(passage.videos[1].status).toBe(3)

            passage.setStatus(passage.videos[1], 4, err => {
                if (err) throw new Error(err)
                expect(passage.videos[1].status).toBe(4)

                done()
            })
        })
    })
})

it("Can add a new note", (done) => {
    let segment = {
        videoCreated:   '2018-01-01 00.00.00',
        noteCreated:    '2018-02-01 00.00.00',
        segmentCreated: '2018-04-01 00.00.00',
        username: 'milesnlwork@gmail.com',
        position: 1.0,
        duration: 22.0,
        url: 'https://blah2.com/blah.webm',
    }

    passage.addNote(segment, err => {
        if (err) throw new Error(err)
        expect(passage.notes.length).toBe(1)
        expect(passage.notes[0].segments.length).toBe(1)
        done()
    })
})

it("Can add a new note segment (out of date order)", (done) => {
    let segment = {
        videoCreated:   '2018-01-01 00.00.00',
        noteCreated:    '2018-02-01 00.00.00',
        segmentCreated: '2018-03-01 00.00.00',
        username: 'milesnlwork@gmail.com',
        position: 1.0,
        duration: 33.0,
        url: 'https://blah3.com/blah.webm',
    }

    passage.addNote(segment, err => {
        if (err) throw new Error(err)
        expect(passage.notes.length).toBe(1)
        expect(passage.notes[0].segments.length).toBe(2)
        expect(passage.notes[0].segments[0].segmentCreated).toBe('2018-03-01 00.00.00')
        done()
    })
})

it("Can resolve a note", (done) => {
    let note = passage.notes[0]

    note.resolve(err => {
        if (err) throw new Error(err)
        expect(passage.notes[0].resolved).toBe(true)
        done()
    })
})

it("Can remove a note segment", (done) => {
    let note = passage.notes[0]
    let _id = note.segments[1]._id

    note.removeSegment(_id, err => {
        if (err) throw new Error(err)
        expect(note.segments.length).toBe(1)
        done()
    })
})

// Prevent snapshot compare from failing due to running test at different time
function overrideStatusCreated(portion) {
    for (let passage of portion.passages) {
        for (let status of passage.statuses) {
            status.setStatusCreated('2018-03-15 00.00.00')
        }
    }
}

it("Can load passages from DB", (done) => {
    let portions2 = Portions.create({ portions: [] })

    portions2.setDb(_test1)

    portions2.load()
        .then(() => {
            let _portion = portions2.portions[0]
            return _portion.load()
        })
        .then(() => {
            overrideStatusCreated(portions2.portions[0])
            expect(portions2).toMatchSnapshot()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()  // Fail quickly on error (to avoid wait for timeout)
        })
})
