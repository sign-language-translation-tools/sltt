// This component is used to exercise VideoMain and its subcomponents

import React, { Component } from 'react'
import PouchDB from 'pouchdb'
import PouchDBAdapterMemory from 'pouchdb-adapter-memory'

import PassageList from './PassageList.jsx'
import { Portions } from '../../models/Portions.js'
import { Project } from '../../models/Project.js'

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

portions.addPortion('Matthew', (err) => {
    if (err) throw new Error(err)

    let portion = portions.portions[0]
    project.setPortion(portion)

    portion.addPassage('Mat 1.1-5', (err) => {
        if (err) throw new Error(err)

        portion.addPassage('Mat 1.6-8')
    })
})


class PassageListTest extends Component {
    render() {
        return (
            <PassageList project={project} />
        )
    }

}

export default PassageListTest
