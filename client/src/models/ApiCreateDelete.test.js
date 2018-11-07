import _ from 'underscore'

let dotenv = require('dotenv')
dotenv.config({path: '/users/nmiles/sltt_environment'})

// FLAKEY!
// - cannot run twice w/o restarting server. I suspect sever is caching a copy of the DB
//   even tho we have deleted the corresponding directory. Fix how?
// - Whenever server returns an error I never see it in the catch block.
//   Instead vsc says I am not catching error. Why?
// - Cannot reliably set any break points

// Uncomment to test against server running on localhost
process.env.REACT_APP_WEB_HOSTNAME = 'localhost'

require('../components/auth/User.js').user.setupTestUser()

let { createProject, deleteProject } = require('./Api.js')

it("can create project _test4", (done) => {
    createProject('_test4')
        .then(() => { done() })
        .catch(err => {
            expect(err).toBeFalsy()
        })
})

it("can delete project _test4", (done) => {
    deleteProject('_test4')
        .then(() => { done() })
        .catch(err => {
            expect(err).toBeFalsy()
            done()
        })
})
