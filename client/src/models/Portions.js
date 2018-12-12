/*
     #item/<portion name>/portion
     #item/<portion name>/<passage name>/passage
 */ 

import { types, getParent } from "mobx-state-tree"
import _ from 'underscore'
import { detach } from "mobx-state-tree"

import { Passage } from './Passages.js'
import { _insertBy, removeFromDB } from './ModelUtils.js'

const debug = require('debug')('sltt:Portions') 


function _move(db, items, _id, newIndex, cb) { 
    let oldIndex = _.findIndex(items, { _id })
    if (oldIndex < 0) {
        cb(`_move: cannot find ${_id}`)
        return
    }

    if (oldIndex === newIndex) return

    // Moving an array element which is a model from array element oldIndex to newIndex is tricky. 
    // As far as I can tell you can't just use splice
    // to extract and then reinsert a model in mobx-state-tree array.
    // Removing the item from the array 'kills' it and then it cannot be resinerted.
    // Instead you need to get a plain js object representing the model and then reinsert that.
    let item = items[oldIndex].toJSON()
    items.splice(oldIndex, 1)
    items.splice(newIndex, 0, item)

    let prevRank = 0.0
    let nextRank = 200.0

    if (newIndex > 0) {
        prevRank = items[newIndex-1].rank
        nextRank = prevRank + 200.0
    }
    if (newIndex < items.length-1) { 
        nextRank = items[newIndex+1].rank
    }
    let newRank = (prevRank + nextRank) / 2.0
    items[newIndex].rank = newRank

    db.get(_id)
        .then(doc => {
            doc.rank = newRank
            return db.put(doc)
        })
        .then(() => cb && cb())
        .catch(err => { cb && cb(err) })
}

function _apply(doc, list) {
    if (doc._deleted) {
        let idx = _.findIndex(list, { _id: doc._id })
        if (idx < 0) return
        list.splice(idx, 1)
        return
    }

    _insertBy(doc, list, 'rank')
}

function _add(_db, doc, list, cb) {
    let rank = 100.0
    if (list.length > 0) rank = list[list.length - 1].rank + 100.0
    doc.rank = rank

    list.push(doc)

    _db.put(doc)
        .then(() => cb && cb())
        .catch(err => { 
            debug(err)
            cb && cb(err) 
        })
}

function _invalidNameCheck(name) {
    let match = name.match(/^[\w \-.]+$/)
    if (!match) return 'Must have only letters, numbers, hyphen(-), periods(.), and spaces'
    return null
}

function _duplicateCheck(items, name) {
    name = name.trim()
    if (_.findWhere(items, { name }))
        return 'Duplicate name'

    return null
}


// ================== PORTION =====================

// A portion is a related list of passages.


export const Portion = types.model("Portion", {
    _id: types.identifier(),
    name: types.string,
    // displayName: types.optional(types.string),
            // In order to allow renaming a portion without going back and changing all the references
            // to db items that mention the old name we will (someday) support a 'displayName' that
            // we show to the user.
    rank: types.number,  // order of this portion in the list of portions for this project
    passages: types.array(Passage, [])
})
.actions(self => ({
    load: () => {
        let options = {
            startkey: self.name + '/',
            endkey: self.name + '/\uffff',
            include_docs: true,
        }

        return new Promise((resolve, reject) => {
            self.getDb()
                .allDocs(options)
                .then(response => {
                    // response = {rows: [{doc: {...} }]}

                    let nonSegmentsRows = response.rows.filter(row => row.doc.tag !== 'segment')
                    let segmentRows = response.rows.filter(row => row.doc.tag === 'segment')

                    // process the segments last since they have to be applied individual
                    // VideoPassage entries
                    nonSegmentsRows.forEach(row => self.apply(row.doc))
                    segmentRows.forEach(row => self.apply(row.doc))

                    resolve()
                })
                .catch(err => {
                    let message = `${self.getName()} Portion.load ${err.stack}`
                    console.log(message)
                    debug('*** ' + message)
                    reject(message)
                })
        })
    },

    getDb() {
        let portions = getParent(self, 2)
        let _db = portions.getDb()
        return _db
    },

    // Accept a portions document from the database and apply it to the model
    apply: (doc) => {
        let parts = doc._id.split('/')
        
        if (parts[0] === '#item') {
            if (!doc.statuses) doc.statuses = [] // data migration
            _apply(doc, self.passages)
            return
        }

        let name = parts[1]
        let passage = _.findWhere(self.passages, { name })
        if (!passage) {
            debug(`${ self.getName() } *** no matching passage for ${doc._id}`)
            return
        }

        passage.apply(doc)
    },

    movePassage: (_id, newIndex, cb) => { 
        let _db = self.getDb()
        _move(_db, self.passages, _id, newIndex, cb) 
    },    

    removePassageReference(_id) {
        let project
        
        try {
            project = self.getProject()
        } catch (error) {
            // no parent, so no need to remove reference from parent
            // normally this should only happen when running unit tests
            return            
        }

        if (project.passage && project.passage._id === _id) {
            project.setPassage(null)
        }
    },

    removePassage: (_id, cb) => { 
        self.removePassageReference(_id)

        let idx = _.findIndex(self.passages, { _id })
        if (idx < 0) {
            cb(`_remove: cannot find ${_id}`)
            return
        }

        // we need to use detach rather than splice here because
        // splice immediately makes the object inaccessible and it is hard to
        // stop react from accessing it in that state and crashing
        detach(self.passages[idx])

        // Match this item all its subitems (if any).
        // E.g. for the portition #item/Progigal Son/portion
        // we also want to match the passage #item/Prodigal Son/Part 1/passage

        let itemsId = _id.slice(0, -('/passage'.length)) + '/'

        let videosId = itemsId.slice('#item/'.length)

        debug(`${self.getName()} removePassages ${itemsId}, ${videosId}`)

        let _db = self.getDb()

        removeFromDB(_db, videosId)
            .then(removeFromDB(_db, itemsId))
            .then(() => cb && cb())
            .catch(err => cb && cb(err))
    },    

    _addPassage: (name, cb) => {
        let err = self.checkName(name)
        if (err) {
            cb && cb(err)
            return
        }

        let _id = `#item/${self.name}/${name}/passage`
        let doc = { 
            _id, 
            name, 
            statuses: [],
            notes: [],
            videos: [],
        }
        _add(self.getDb(), doc, self.passages, cb)
    },
    
    addPassage: (name, cb) => {
        if (cb)
            return self._addPassage(name, cb)

        return new Promise((resolve, reject) => {
            self._addPassage(name, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    },

    checkName: (name) => {
        return _invalidNameCheck(name) || _duplicateCheck(self.passages, name)
    },

    rename: (name, cb) => {
        cb('Renaming portions is not supported yet, sorry.')
        return

        // I think the following code is more or less right.
        // We would need to change all the ui components to use displayName instead of
        // name when then displayName has been set.

        // eslint-disable-next-line
        let err = self.checkName(name)
        if (err) {
            debug(`${self.getName()} *** rename ${err}`)
            cb && cb(err)
            return
        }

        let db = self.getDb()
        db.get(self._id)
            .then(doc => {
                doc.displayName = name
                return db.put(doc)
            })
            .then(() => cb && cb())
            .catch(err => { cb && cb(err) })
    },

    getProject: () => {
        let project = getParent(self, 3)
        return project
    },

    // Get name of portion for debugging purposes.
    // Don't crash no matter what.
    getName: () => {
        try {
            let project = self.getProject()
            return `[${project.name}/${self.name}]` 
        } catch (err) {
            return '*unknown*'
        }
    },

}))
.views(self => ({
    // true iff any passage in this portion has video already recorded
    get videod() {
        return self.passages.some(passage => passage.videod)
    },
}))


// ================== PORTIONS =======================

export const Portions = types.model("Portions", {
    portions: types.array(Portion, []),
})
.actions(self => {
    let _db

    return {
        load: () => {
            debug(`[${self.getProjectName()}] Portions#load`)

            let options = {
                startkey: '#item/',
                endkey: '#item/ufff0',
                include_docs: true,
            }

            let isPortion = row => (row.doc._id.endsWith('/portion'))
            let isPassage = row => (row.doc._id.endsWith('/passage'))

            return new Promise((resolve, reject) => {
                _db.allDocs(options)
                    .then(response => {
                        debug(`   [${self.getProjectName()}] Portions#load [rows=${response.rows.length}]`)
                        // response = {rows: [{doc: {...} }]}

                        // Process portions first so we have an owner for each passage
                        _.chain(response.rows)
                            .filter(isPortion)
                            .forEach(row => self.apply(row.doc))
                            
                        _.chain(response.rows)
                            .filter(isPassage)
                            .forEach(row => self.apply(row.doc))

                        resolve()
                    })
                    .catch(err => reject(err))
            }) 
        },

        apply: (doc) => {
            //debug('portions apply', doc._id)

            let parts = doc._id.split('/')
            let tag = parts[parts.length-1]

            if (parts[0] === '#item' && tag === 'portion') { 
                _apply(doc, self.portions)
                return
            }

            if (parts[0] === '#item' && tag === 'passage') {
                let portionName = doc._id.split('/')[1]
                
                // We inserted the portions first so we should 'always' find a matching 
                // portion for this passage
                let idx = _.findIndex(self.portions, { name: portionName })
                if (idx < 0) {
                    console.warn(`[${self.project.name}] Portions#apply item Portion not found [${doc._id}]`)
                    return
                }

                self.portions[idx].apply(doc)
                return
            }

            let name = parts[0]
            let portion = _.findWhere(self.portions, { name })
            if (!portion) {
                console.warn(`[${self.getProjectName()}] Portions#apply non item Portion not found [${doc._id}]`)
                return
            }

            portion.apply(doc)
        },

        setDb: (db) => { _db = db },

        getDb: () => { return _db },

        getProject: () => {
            let project = getParent(self, 1)
            return project
        },

        getProjectName: () => {
            try {
                return self.getProject().name
            } catch (err) {
                return '*unknown*'
            }
        },

        movePortion: (_id, newIndex, cb) => {
            _move(_db, self.portions, _id, newIndex, cb)
        },

        removePortionReference(_id) {
            let project

            try {
                project = self.getProject()
            } catch (error) {
                // no parent, so no need to remove reference from parent
                // normally this should only happen when running unit tests
                return
            }

            let portions = project.portions.portions

            if (project.portion && project.portion._id === _id) {
                if (portions.length > 0) {
                    project.setPortion(portions[0])
                } else {
                    project.setPortion(null)
                }
            }
        },

        removePortion: (_id, cb) => {
            self.removePortionReference(_id)

            let idx = _.findIndex(self.portions, { _id })
            if (idx < 0) {
                cb(`_remove: cannot find ${_id}`)
                return
            }

            // we need to use detach rather than splice here because
            // splice immediately makes the object inaccessible and it is hard to
            // stop react from accessing it in that state and crashing
            detach(self.portions[idx])

            // Match this item all its subitems (if any).
            // E.g. for the portition #item/Progigal Son/portion
            // we also want to match the passage #item/Prodigal Son/Part 1/passage

            let itemsId = _id.slice(0, -('/portion'.length)) + '/'

            let videosId = itemsId.slice('#item/'.length)

            debug(`[${self.getProjectName()}] Portions#removePortions`, itemsId, videosId)

            removeFromDB(_db, videosId)
                .then(removeFromDB(_db, itemsId))
                .then(() => cb && cb())
                .catch(err => cb && cb(err))
        },

        _addPortion: (name, cb) => {
            let err = self.checkName(name)
            if (err) {
                cb && cb(err)
                return
            }

            let _id = `#item/${name}/portion`
            let doc = { _id, name, passages: [] }
            _add(_db, doc, self.portions, cb)
        },

        addPortion: (name, cb) => {
            if (cb)
                return self._addPortion(name, cb)

            return new Promise((resolve, reject) => {
                self._addPortion(name, err => {
                    if (err) reject(err)
                    else resolve()
                })
            })
        },


        checkName: (name) => {
            return _invalidNameCheck(name) || _duplicateCheck(self.portions, name)
        }, 

    }
})
.views(self => ({
    get project() {
        return getParent(self, 1)
    },    
}))

