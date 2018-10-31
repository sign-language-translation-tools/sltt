import { types } from "mobx-state-tree"
import _ from 'underscore'

import { Portion, Portions } from './Portions.js'
import { Passage, PassageNote, PassageVideo } from './Passages.js'
import { Members } from './Members.js'
import { createDb } from './Db.js'
import { timestamp } from './Passages.js'

const log = require('debug')('sltt:Project') 

export const Project = types.model("Project", {
    name: types.string,
    portions: types.maybe(Portions),
    members: types.maybe(Members),
    
    portion: types.maybe(types.reference(Portion)), // currently selected portion
    passage: types.maybe(types.reference(Passage)), // currently selected passage
    passageVideo: types.maybe(types.reference(PassageVideo)), // currently selected passage video
    note: types.maybe(types.reference(PassageNote)), // currently selected note (null except when a note is open)
    videoTourSignedUrl: types.optional(types.string, ''), // currently playing tour video
    
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

            self.portions.load()  // fetch portions from server
                .then(() => { 
                    return self.members.load() // fetch members from server
                })
                .then(() => { 
                    self.setRole() // determine user role in project and thus their permissions
                })
                .then(() => { 
                    self.restoreDefaults(err => {  // set project to point to  portion and passage based on save values in localStorage
                        log('initialize done', err)
                        cb && cb(err)
                    })
                })
                .catch(err => { 
                    log(`*** [${self.name}] initialize error: ${err}`)
                    cb && cb(err) 
                })
        },

        //!!! also invoke this when members doc changes (also handle case where user is removed from project)

        // Determine this user's role in the project.
        setRole: () => {
            let item = null
            if (self.members)
                item = _.findWhere(self.members.items, {email: self.username})

            
            self.iAmAdmin = false
            self.iAmTranslator = false
            self.iAmConsultant = false
            
            let role = item && item.role
            log(`setRole ${self.username} = ${role}`)
            
            if (role === 'admin') 
                self.iAmAdmin = true
            
            if (role === 'translator' || role === 'admin') 
                self.iAmTranslator = true
            
            if (role === 'consultant' || role === 'translator' || role === 'admin') 
                self.iAmConsultant = true
        },

        setVideoTourSignedUrl: (videoTourSignedUrl) => { self.videoTourSignedUrl = videoTourSignedUrl},

        getDb: () => { return _db },

        setPassage: (passage, cb) => {
            log(`[${self.name}] setPassage: ${passage && passage.name}`)

            self.passage = passage
            if (!passage) {
                self.passageVideo = null
                cb && cb()
                return
            }
            
            let videos = passage.videosNotDeleted
            let passageVideo = passage && _.last(videos)

            //log(`[${self.name}] setPassage |${passage && passage._id} | ${video && video._id}|`)

            self.saveDefaults()

            self.passageVideo = passageVideo
            if (passageVideo) passageVideo.getSignedUrl(cb)
            else if (cb) cb(null)
        },

        // Select a specific video for this passage.
        // Make sure that its signedUrl field is set so that it can be played.
        setPassageVideo: (passage, passageVideo, cb) => {
            self.passage = passage
            self.passageVideo = passageVideo
            if (passageVideo) passageVideo.getSignedUrl(cb)
            else if (cb) cb(null)
        },

        // portion may be null [means unset]
        // cb may be null.
        // cb does not happen until info for portion has been loaded from server.

        setPortion: (portion, cb) => {
            log(`[${self.name}] setPortion: ${portion && portion.name}`)

            self.portion = portion 
            self.passage = null
            self.passageVideo = null
            
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

            //log(`saveDefaults`, defaults)
            localStorage.setItem(self.defaultsStorageName(), JSON.stringify(defaults))
        },

        // Retrieve the previous user settings from local storage.
        // Attempt to set project to previously selected portion and passage.
        restoreDefaults(cb) {
            log(`[${self.name}] restoreDefaults`)

            if (typeof localStorage === 'undefined') {
                // we are not running in a browser
                // this should only happen during unit tests
                cb()
                return
            }

            let defaults
            try {
                let text = localStorage.getItem(self.defaultsStorageName())
                defaults = (text && JSON.parse(text))
            } catch (error) {
                log(`*** restoreDefaults ${error}`)
            }

            defaults = defaults || { portionName: null, passageName: null }

            let portions = self.portions.portions

            // Look for a previously selected portion. If not found default to first portion present if any.
            let portion = _.findWhere(portions, { name: defaults.portionName }) || 
                                portions.slice(0, 1).pop() || null
            self.setPortion(portion, err => {
                if (err) {
                    log(`*** restoreDefaults#setPortion ${err}`)
                    self.setPassage(null)
                    return
                }

                let passages = (portion && portion.passages) || []
                let passage = _.findWhere(passages, { name: defaults.passageName }) ||
                    passages.slice(0, 1).pop() || null
                self.setPassage(passage, cb)
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
                    log(err)
                    return
                }
                self._setNote(note)
            })
        },

        _setNote: (note) => { self.note = note },

        createNote: (position) => {
            log('createNote', position)

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
        // Listen for changes to the database coming from the server.
        // Apply them to the members and portion models.

        listenForChanges: () => {
            let options = {
                live: true,
                since: 'now',
                include_docs: true,
                // timeout: 60000,
                // heartbeat: 20000,
                // continuous: true,
            }

            self.changeListener = _db.changes(options)
                .on('change', change => {
                    log(`[${self.name}] on.change ${change.doc._id}`)
                    if (self.members) self.members.apply(change.doc)
                    if (self.portions) self.portions.apply(change.doc)
                })
                .on('error', err => {
                    //if (err.message === 'ETIMEDOUT') return
                    log(`*** [${self.name}] listenForChanges err = ${JSON.stringify(err)}`)
                })
        },

        // Cancel listening for changes.
        // If we don't do this on logout we get TIMEOUT errors.
        cancel: () => {
            log(`[${self.name}] cancel`)

            self.changeListener.cancel()
        }

    }
})


