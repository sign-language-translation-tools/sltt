import { Project } from './Project.js'
import { createDb, initializeTestProjects, destroyTestDbs } from './Db.js'

let dotenv = require('dotenv')
dotenv.config({ path: '/users/nmiles/sltt_environment' })
process.env.NODE_ENV = 'localserver'

require('../components/auth/User.js').user.setupTestUser()

const name = '_test1'
const milesnl = 'milesnlwork@gmail.com'
const newguy = 'newguy@gmail.com'

let prj, prj2

it("can create/initialize test project", (done) => {
    let _test1Db

    destroyTestDbs(err1 => {
        // _test1: { members: milesnlwork@gmail.com/admin, bob@gmail.com/translator }
        expect(err1).toBeFalsy()

        initializeTestProjects(err2 => {
            expect(err2).toBeFalsy()

            _test1Db = createDb('_test1')
            done()
        })
    })
})


it("can create project with no members", (done) => {
    prj = Project.create({ 
        name,
        members: {
            items: []
        }
     })

    expect(prj.name).toBe(name)
    expect(prj.members.items.length).toBe(0)

    done()
})

// it("can initialize (load) project", (done) => {
//     prj.initialize(err => {
//         expect(err).toBeFalsy()
//         expect(prj.members.items.length).toBe(2)
//         done()
//     })
// })

// it("can add a member", (done) => {
//     prj.members.add(newguy, (err) => {
//         expect(err).toBeFalsy()
//         expect(prj.members.items.length).toBe(3)
//         expect(prj.members.items[2].email).toBe(newguy)
//         done()
//     })
// })

// it("can set role", (done) => {
//     prj.members.setRole(newguy, 'consultant', (err) => {
//         expect(err).toBeFalsy()
//         expect(prj.members.items[2].role).toBe('consultant')
//         done()
//     })
// })

// it("does not allow duplicate email", (done) => {
//     try {
//         prj.members.add(newguy)
//         expect(false).toBeTruthy()
//         done()
//     }
//     catch (e) {
//         expect(e.message).toContain('Duplicate')
//         expect(prj.members.items.length).toBe(3)
//         done()
//     }
// })

// it("can delete member", (done) => {
//     prj.members.delete(newguy, err => {
//         expect(err).toBeFalsy()
//         expect(prj.members.items.length).toBe(2)
//         expect(prj.members.items[1].email).toBe("bob@gmail.com")
//         done()
//     })
// })


// // it("parallel project is notified of member changes", (done) => {
// //     checkForMember(0, prj2, done)
// // })
