import PouchDB from 'pouchdb'
import PouchDBAdapterMemory from 'pouchdb-adapter-memory'

import { Portions } from './Portions.js'
import { Project } from './Project.js'

// Create in-memory test DB
PouchDB.plugin(PouchDBAdapterMemory)
let dbName = 'DB' + Math.random().toString(8)
let _test1 = new PouchDB(dbName, { adapter: 'memory' })

export const project = Project.create({
    name: 'ASLVtest',
    iAmAdmin: true,
    iAmTranslator: true,
    iAmConsultant: true,
    iAmOberserver: true,
})

let portions = Portions.create({ portions: [] })
project.setPortions(portions)

portions.setDb(_test1)

// Add the following to our temporary DB
//     portion: Matthew
//         passage: Mat 1.1-5
//             video
//         passage: Mat 1.7-8

async function initializeProject() {
    let err1 = await new Promise(resolve => portions.addPortion('Matthew', resolve))
    if (err1) throw new Error(err1)

    let portion = portions.portions[0]
    let err2 = await new Promise(resolve => portion.addPassage('Mat 1.1-5', resolve))
    if (err2) throw new Error(err2)
    let err3 = await new Promise(resolve => portion.addPassage('Mat 1.7-8', resolve))
    if (err3) throw new Error(err3)

    let passage = portion.passages[0]

    let url = "ASLVtest/Matthew/Mat_1.1-5/2018-04-23_19.39.02.webm"

    let doc = {
        username: "milesnlwork@gmail.com",
        duration: 6.224,
        videoCreated: "2018-04-23 19.39.02",
        url,
    }
    passage.addVideo(doc)

    //project.setPassage(passage)
    project.setPortion(portion)
}

initializeProject()
