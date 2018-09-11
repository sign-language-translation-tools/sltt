// Create a project corresponding to ASLVtest.
// Make sure it has at least one portion present.

import { Project } from './Project.js'

export const project = Project.create({
    name: 'ASLVtest',
    username: 'milesnlwork@gmail.com',
    iAmAdmin: true,
    iAmTranslator: true,
    iAmConsultant: true,
    iAmOberserver: true,
})

function addPortion(err) {
    let portions = project.portions
    if (portions.portions.length === 0) {
        portions.addPortion('Matthew', err => {
            if (err) throw new Error(err)
            project.setPortion(project.portions.portions[0])
        })
        return
    }

    project.setPortion(project.portions.portions[0])
}

let initialized = false

export function initializeProject() {
    if (!initialized) {
        project.initialize(addPortion)
        initialized = true
    }
}
