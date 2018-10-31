import _ from 'underscore'

let dotenv = require('dotenv')
dotenv.config({path: '/users/nmiles/slEnvFile'})

// Uncomment to test against server running on localhost
// process.env.NODE_ENV = 'localserver'

require('../components/auth/User.js').user.setupTestUser()

let { createDb, initializeTestProjects, destroyTestDbs, getAuthorizedProjects } = require('./Db.js')

// Initial test config members info
//
//     _test1: { milesnlwork@gmail.com/admin, bob@gmail.com/translator }
//     _test2: { milesnlwork@gmail.com/translator, bob@gmail.com/admin }
//     _test3: { bob@gmail.com/admin }

let _test1, _test2, _test3

it("can destroy/(re)initialize/create 3 test projects", (done) => {
    destroyTestDbs(err1 => {
        expect(err1).toBeFalsy()

        initializeTestProjects(err2 => {
            expect(err2).toBeFalsy()

            _test1 = createDb('_test1')
            _test2 = createDb('_test2')
            _test3 = createDb('_test3')
            done()
        })
    })
})

it("can get projects in which user is a member", (done) => {
    getAuthorizedProjects((err, projects) => {
        expect(err).toBeFalsy()
        expect(_.contains(projects, '_test1')).toBeTruthy()
        expect(_.contains(projects, '_test2')).toBeTruthy()
        done()
    })
})


it("can get members for projects in which user is a member", (done) => {
    _test1.get('members')
        .then(doc => {
            expect(doc).toBeTruthy()
            expect(doc.items).toBeTruthy()
            expect(doc.items.length).toBe(2)
        })
        .then(() => _test2.get('members'))
        .then(doc => {
            expect(doc).toBeTruthy()
            expect(doc.items).toBeTruthy()
            expect(doc.items.length).toBe(2)
            done()
        })
})

it("fails to get members if user is not a member", (done) => {
    _test3.get('members')
        .catch(err => {
            expect(err.status).toBe(404)
            done()
        })
})

it("admin can add a member", (done) => {
    _test1.get('members')
        .then(doc => {
            doc.items.push({email: 'sam@gmail.org', role: 'consultant'})
            return _test1.put(doc)
        })
        .then(() => _test1.get('members'))
        .then(doc => {
            expect(doc.items.length).toBe(3)
            done()
        })
})

it("non admin cannot add a member", (done) => {
    _test2.get('members')
        .then(doc => {
            doc.items.push({ email: 'sam@gmail.org', role: 'consultant' })
            return _test2.put(doc)
        })
        .catch(err => {
            expect(err.status).toBe(404)
            done()
        })
})

