import _ from 'underscore'
import PouchDB from 'pouchdb'

import { Portions, Portion } from './Portions.js'

// Create in-memory test DB
PouchDB.plugin(require('pouchdb-adapter-memory'))
let dbName = 'DB' + Math.random().toString(8)
let _test1 = new PouchDB(dbName, { adapter: 'memory' })


let portions, portion

it("Can create empty Portions", (done) => {
    portions = Portions.create({ portions: [] })
    portions.setDb(_test1)
    expect(portions.portions.length).toBe(0)
    done()
})

it("Can add portions 1 of 3", (done) => {
    portions.addPortion('Matthew', err => {
        expect(err).toBeFalsy()
        expect(portions.portions.length).toBe(1)
        expect(portions.portions[0].name).toBe('Matthew')
        done()
    })
})

it("Can add portions 2 of 3", (done) => {
    portions.addPortion('Luke', err => {
        expect(err).toBeFalsy()
        expect(portions.portions.length).toBe(2)
        expect(portions.portions[1].name).toBe('Luke')
        done()
    })
})

it("Can add portions 3 of 3", (done) => {
    portions.addPortion('Mark', err => {
        expect(err).toBeFalsy()
        expect(portions.portions.length).toBe(3)
        expect(portions.portions[2].name).toBe('Mark')
        done()
    })
})

it("Does not add duplicate portion", (done) => {
    portions.addPortion('Mark', err => {
        expect(err).toBe('Duplicate name')
        expect(portions.portions.length).toBe(3)
        done()
    })
})

it("Does not add portion with invalid name", (done) => {
    portions.addPortion('#Bob', err => {
        expect(err).toBeTruthy()
        expect(portions.portions.length).toBe(3)
        done()
    })
})


it("Can move portion", (done) => {
    let _id = portions.portions[2]._id
    portions.movePortion(_id, 1, err => {
        expect(err).toBeFalsy()
        let names = _.pluck(portions.portions, 'name')

        expect(names).toEqual(['Matthew', 'Mark', 'Luke'])
        done()
    })
})

it("Can remove portion", (done) => {
    let _id = portions.portions[0]._id
    portions.removePortion(_id, err => {
        expect(err).toBeFalsy()
        let names = _.pluck(portions.portions, 'name')

        expect(names).toEqual(['Mark', 'Luke'])
        done()
    })
})

// ========== Passages tests ============


it("Can add passages 1 of 3", (done) => {
    portion = portions.portions[0]
    let name = 'Mark 1.1-3'
    portion.addPassage(name, err => {
        expect(err).toBeFalsy()
        expect(portion.passages.length).toBe(1)
        expect(portion.passages[0].name).toBe(name)
        done()
    })
})

it("Can add passages 2 of 3", (done) => {
    let name = 'Mark 1.7-9'
    portion.addPassage(name, err => {
        expect(err).toBeFalsy()
        expect(portion.passages.length).toBe(2)
        expect(portion.passages[1].name).toBe(name)
        done()
    })
})

it("Can add passages 3 of 3", (done) => {
    let name = 'Mark 1.4-6'
    portion.addPassage(name, err => {
        expect(err).toBeFalsy()
        expect(portion.passages.length).toBe(3)
        expect(portion.passages[2].name).toBe(name)
        done()
    })
})

it("Does not add duplicate passage", (done) => {
    let name = 'Mark 1.1-3'
    portion.addPassage(name, err => {
        expect(err).toBeTruthy()
        expect(portion.passages.length).toBe(3)
        done()
    })
})

it("Does not add passage with invalid name", (done) => {
    portion.addPassage('#Bob', err => {
        expect(err).toBeTruthy()
        expect(portion.passages.length).toBe(3)
        done()
    })
})

it("Can move passage", (done) => {
    let _id = portion.passages[2]._id
    let names1 = _.pluck(portion.passages, 'name')

    portion.movePassage(_id, 1, err => {
        expect(err).toBeFalsy()
        let names = _.pluck(portion.passages, 'name')

        expect(names).toEqual(['Mark 1.1-3', 'Mark 1.4-6', 'Mark 1.7-9'])
        done()
    })
})

it("Can remove passage", (done) => {
    let _id = portion.passages[0]._id

    let names = _.pluck(portion.passages, 'name')
    portion.removePassage(_id, err => {
        expect(err).toBeFalsy()
        names = _.pluck(portion.passages, 'name')

        expect(names).toEqual(['Mark 1.4-6', 'Mark 1.7-9'])
        done()
    })
})

it("Can load passages from DB", (done) => {
    let portions2 = Portions.create({ portions: [] })

    portions2.setDb(_test1)

    portions2.load()
        .then(() => {
            expect(portions2).toMatchSnapshot()
            done()
        })
        .catch(err => {
            expect(err).toBeFalsy()  // Fail expectation on purpose
        })
})
