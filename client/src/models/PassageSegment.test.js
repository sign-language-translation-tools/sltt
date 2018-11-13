import _ from 'underscore'
import PouchDB from 'pouchdb'
import { getSnapshot } from "mobx-state-tree"


// Create an in-memory test DB.
// Exercise the model functions relating to PassageSegment

import { Project } from 'models/Project.js'
import { Portions } from 'models/Portions.js'

const expect = require('expect')

//import { Passages, Passage, PassageVideo, PassageNote, PassageNoteSegment } from './Passages.js'

//require('../components/auth/User.js').user.setupTestUser()

// Create in-memory test DB
PouchDB.plugin(require('pouchdb-adapter-memory'))
let dbName = 'DB' + Math.random().toString(8)
let _test1 = new PouchDB(dbName, { adapter: 'memory' })

let portions, portion, passage, video, segmentCreated

const project = Project.create({ name: 'ASLVtest' })

// Setup objects necessary to test PassageSegments
const setup = async function() {
    portions = Portions.create({ portions: [] })
    let snap = getSnapshot(portions)
    project.setPortions(snap)
    portions.setDb(_test1)
    
    await portions.addPortion('Matthew')
    expect(portions.portions.length).toBe(1)

    portion = portions.portions[0]
    
    await portion.addPassage('Mat 1.1-5')
    passage = portion.passages[0] 
    
    await portion.addPassage('Mat 1.6-8')
    expect(portion.passages.length).toBe(2)

    let doc = {
        _id: 'Matthew/Mat 1.6-8/2018-01-01 00.00.00.webm/video',
        username: 'milesnlwork@gmail.com',
        videoCreated: '2018-01-01 00.00.00',
        url: 'Matthew/Mat 1.6-8/2018-01-01 00.00.00.webm',
        duration: 33.0,
        segments: [],
    }

    await passage.addVideo(doc)
    expect(passage.videos.length).toBe(1)

    video = passage.videos[0]
    expect(video).toBeTruthy()
}
    
// Test PassageSegment related functions
const test = async function() {
    await video.addSegment(1)
    expect(video.segments.length).toBe(1)
    
    await video.addSegment(3)
    expect(video.segments.length).toBe(2)
    
    let segment = video.segments[0]
    await segment.upsertPosition(2.5)
    expect(video.segments[0].position).toBe(2.5)

    let segmentCreated2 = video.segments[1].segmentCreated
    await video.removeSegment(segmentCreated2)
    expect(video.segments.length).toBe(1)
}

// Test ability to reload PassageSegments
const testReload = async function () {
    let portions2 = Portions.create({ portions: [] })
    
    portions2.setDb(_test1)

    await portions2.load()
    
    let _portion = portions2.portions[0]
    await _portion.load()
    
    let _seg = {
        _id: `Matthew/Mat 1.1-5/2018-01-01 00.00.00 ${segmentCreated}/segment`,
        videoCreated: "2018-01-01 00.00.00",
        segmentCreated: `${segmentCreated}`,
        position: 2.5,
        labels: [],
        cc: ""
    }
    
    let passage = portions2.portions[0].passages[0]
    expect(passage.videos.length).toBe(1)
    expect(passage.videos[0].segments.length).toBe(1)
    let seg = getSnapshot(passage.videos[0].segments[0])
    //console.log(JSON.stringify(seg, null, 3))

    expect(seg).toEqual(_seg)
}


const run = async function () {
    await setup()
    await test()
    await testReload()
}

it("Can create, update, delete, and reload segments", (done) => {
    run()
        .then(() => done())
})



