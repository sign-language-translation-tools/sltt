import { types } from "mobx-state-tree"
import _ from 'underscore'

import { Portion, Portions } from './Portions.js'
import { Passage, PassageNote, PassageVideo } from './Passages.js'
import { Members } from './Members.js'
import { createDb } from './Db.js'
import { timestamp } from './Passages.js'


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
                    self.restoreDefaults(cb)
                })
                .catch(err => { 
                    console.error(`[${self.name}] Project#initialize error: ${err}`)
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
            console.log(`[${self.name}] Project#setPassage: ${passage && passage.name}`)

            self.passage = passage
            if (!passage) {
                self.passageVideo = null
                cb && cb()
                return
            }
            
            let videos = passage.videosNotDeleted
            let passageVideo = passage && _.last(videos)

            //console.log(`[${self.name}] setPassage |${passage && passage._id} | ${video && video._id}|`)

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
            console.log(`[${self.name}] Project#setPortion: ${portion && portion.name}`)

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

            //console.log(`saveDefaults`, defaults)
            localStorage.setItem(self.defaultsStorageName(), JSON.stringify(defaults))
        },

        restoreDefaults(cb) {
            console.log(`[${self.name}] Project#restoreDefaults`)

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

            self.changeListener = _db.changes(options)
                .on('change', change => {
                    console.log(`[${self.name}] on.change ${change.doc._id}`)
                    if (self.members) self.members.apply(change.doc)
                    if (self.portions) self.portions.apply(change.doc)
                })
                .on('error', err => {
                    //if (err.message === 'ETIMEDOUT') return
                    console.error(`[${self.name}] Project#listenForChanges err = ${JSON.stringify(err)}`)
                })
        },

        // Cancel listening for changes.
        // If we don't do this on logout we get TIMEOUT errors.
        cancel: () => {
            console.log(`[${self.name}] Project#cancel`)

            self.changeListener.cancel()
        }

    }
})


