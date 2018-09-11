import { types } from "mobx-state-tree"
import _ from 'underscore'

import { Portion, Portions } from './Portions.js'
import { Passage, PassageNote, PassageVideo } from './Passages.js'
import { Members } from './Members.js'
import { createDb, getAuthorizedProjects } from './Db.js'
import { timestamp } from './Passages.js'

// import _ from 'underscore'


export const Project = types.model("Project", {
    name: types.string,
    portions: types.maybe(Portions),
    members: types.maybe(Members),
    
    portion: types.maybe(types.reference(Portion)), // currently selected portion
    passage: types.maybe(types.reference(Passage)), // currently selected passage
    passageVideo: types.maybe(types.reference(PassageVideo)), // currently selected passage video
    note: types.maybe(types.reference(PassageNote)), // currently selected passage
    
    username: types.optional(types.string, ''),
    iAmAdmin: types.optional(types.boolean, true),
    iAmTranslator: types.optional(types.boolean, true),
    iAmConsultant: types.optional(types.boolean, true),
})
.actions(self => {
    let _db = null

    return {
        initialize: (cb) => {
            _db = createDb(self.name)

            self.members = { items: [] }
            self.portions = { portions: [] }
            self.portions.setDb(_db)
            
            self.listenForChanges()

            self.portions.load()
                .then(() => { 
                    return self.members.load() 
                })
                .then(() => self.setRole())
                .then(() => { 
                    let length
                    // Don't think this could throw but don't want debugging to crash whole banana
                    try {
                        length = self.portions.portions.length
                    } catch (err) {
                    }

                    self.restoreDefaults()

                    console.log(`[${self.name}] portions.load done (${length})`)
                    cb && cb() 
                })
                .catch(err => { 
                    console.error(`${self.name} portions loaded error: ${err}`)
                    cb && cb(err) 
                })
        },

        //!!! also invoke this when members doc changes (also handle case where user is removed from project)
        setRole: () => {
            let item = null
            if (self.members)
                item = _.findWhere(self.members.items, {email: self.username})

            self.iAmAdmin = false
            self.iAmTranslator = false
            self.iAmConsultant = false

            let role = item && item.role
            
            if (role === 'admin') 
                self.iAmAdmin = true
            
            if (role === 'translator' || role === 'admin') 
                self.iAmTranslator = true
            
            if (role === 'consultant' || role === 'translator' || role === 'admin') 
                self.iAmConsultant = true
        },

        getDb: () => { return _db },

        setPassage: (passage, cb) => {
            self.passage = passage
            if (!passage) {
                self.passageVideo = null
                return
            }
            
            let videos = passage.videosNotDeleted
            let video = passage && _.last(videos)

            //console.log(`[${self.name}] setPassage |${passage && passage._id} | ${video && video._id}|`)

            self.saveDefaults()

            self.passageVideo = video
            if (video) video.getSignedUrl(cb)
            else if (cb) cb(null)
        },

        setPassageVideo: (passage, video, cb) => {
            self.passage = passage
            self.passageVideo = video
            if (video) video.getSignedUrl(cb)
            else if (cb) cb(null)
        },

        // portion may be null [means unset]
        // cb may be null.
        // cb does not happen until info for portion has been loaded from server.

        setPortion: (portion, cb) => {
            //console.log('Project.setPortion')

            self.portion = portion 
            self.passage = null
            self.saveDefaults()

            if (!portion) {
                cb && cb(null)
                return
            }

            portion.load()  // load info for portion from server
                   .then( () => cb && cb(null))
                   .catch( err => cb && cb(err))
        },

        defaultsStorageName() { return `defaults.${self.name}` },
        
        saveDefaults() {
            let defaults = {
                portionName: self.portion && self.portion.name,
                passageName: self.passage && self.passage.name,
            }

            //console.log(`saveDefaults`, defaults)
            localStorage.setItem(self.defaultsStorageName(), JSON.stringify(defaults))
        },

        restoreDefaults() {
            //console.log(`restoreDefaults`, self.name, self.portions, self.passage)

            let defaults
            try {
                let text = localStorage.getItem(self.defaultsStorageName())
                defaults = (text && JSON.parse(text))
            } catch (error) {
                console.error(error)
            }

            defaults = defaults || { portionName: null, passageName: null }

            //console.log(`restoreDefaults`, defaults)

            let portions = self.portions.portions
            let portion = _.findWhere(portions, { name: defaults.portionName }) || 
                                portions.slice(0, 1).pop() || null
            self.setPortion(portion, err => {
                if (err) {
                    console.error(err)
                    self.setPassage(null)
                    return
                }

                let passages = (portion && portion.passages) || []
                let passage = _.findWhere(passages, { name: defaults.passageName }) ||
                    passages.slice(0, 1).pop() || null
                self.setPassage(passage)
            })

        },

        setPortions: (portions) => { self.portions = portions },

        unsetNote: () => {
            let note = self.note
            if (!note) return
            
            // If a note was created and added to passage but no segments were recorded
            // remove the empty note from the passage.
            if (note.segments.length === 0) {
                self.passage.notes.splice(-1)
            }

            self.note = null
        },

        setNote: (note) => { 
            note.getSignedUrls(err => {
                if (err) {
                    //!!! handle error
                    console.log(err)
                    return
                }
                self._setNote(note)
            })
        },

        _setNote: (note) => { self.note = note },

        createNote: (position) => {
            console.log('createNote', position)

            let passage = self.passage
            let video = _.last(passage.videos)
            let { videoCreated } = video
            let noteCreated = timestamp()

            let note = {
                videoCreated,
                noteCreated,
                position: position,
                segments: [],
                resolved: false,
            }
            passage.pushNote(note)

            let passageNote = _.last(passage.notes)
            self.setNote(passageNote)
        },

        // See https://pouchdb.com/api.html#changes
        listenForChanges: () => {
            let options = {
                live: true,
                since: 'now',
                include_docs: true,
                // timeout: 60000,
                // heartbeat: 20000,
                // continuous: true,
            }

            _db.changes(options)
                .on('change', change => {
                    console.log('change', change.doc)
                    if (self.members) self.members.apply(change.doc)
                    if (self.portions) self.portions.apply(change.doc)
                })
                .on('error', err => {
                    //if (err.message === 'ETIMEDOUT') return
                    let message = `Project.listenForChanges [${self.name}]`
                    console.error(message, err)
                })
        },

    }
})

function _createProject(name, username) {
    return new Promise((resolve, reject) => {
        console.log(`[${name}] _createProject`)

        let project = Project.create({ 
            name,
            username, })

        project.initialize(err => {
            if (err) {
                let message = `[${name}] _createProject ${err.stack}`
                console.error(message)
                resolve(null)
                return
            }

            resolve(project)
        })
    })
}

export const createAllMyProjects = function (username, cb) {
    console.log('createAllMyProjects')

    getAuthorizedProjects((err, projectNames) => {
        console.log(`[${username}] authorizedProjects: ${projectNames}`)
        projectNames = projectNames || []
        let promises = projectNames.map(projectName => _createProject(projectName, username))
        
        Promise.all(promises)
            .then(projects => {
                projects = _.filter(projects, project => project !== null)
                cb(null, projects)
            })
            .catch(err => cb(err))
    })
}

