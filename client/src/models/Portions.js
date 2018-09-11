// Portion actions, unit test

import { types, getParent } from "mobx-state-tree"
import _ from 'underscore'

import { Passage } from './Passages.js'
import { _insertBy, _remove } from './ModelUtils.js'


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
            console.log(err)
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

export const Portion = types.model("Portion", {
    _id: types.identifier(),
    name: types.string,
    rank: types.number,
    passages: types.array(Passage, [])
})
.actions(self => ({
    load: () => {
        let options = {
            startkey: self.name + '/',
            endkey: self.name + '/ufff0',
            include_docs: true,
        }

        return new Promise((resolve, reject) => {
            //console.log("AAA", self.getProject().name)

            self.getDb()
                .allDocs(options)
                .then(response => {
                    // response = {rows: [{doc: {...} }]}
                    for (let row of response.rows) {
                        self.apply(row.doc)
                    }
                    //console.log("BBB", self.getProject().name)
                    resolve()
                })
                .catch(err => {
                    let message = `[${self.getProject().name}/${self.name}] Portion.load ${err.stack}`
                    console.error(message)
                    reject(message)
                })
        })
    },

    getDb() {
        let portions = getParent(self, 2)
        let _db = portions.getDb()
        return _db
    },

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
            console.error(`no matching passage for ${doc._id}`)
            //throw new Error('') //!!
            return
        }

        passage.apply(doc)
    },

    movePassage: (_id, newIndex, cb) => { 
        let _db = self.getDb()
        _move(_db, self.passages, _id, newIndex, cb) 
    },    

    removePassage: (_id, cb) => { 
        let _db = self.getDb()
        _remove(_db, self.passages, _id, cb) 
    },    

    addPassage: (name, cb) => {
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

    checkName: (name) => {
        return _invalidNameCheck(name) || _duplicateCheck(self.passages, name)
    },

    getProject: () => {
        let project = getParent(self, 3)
        return project
    },

}))

// Portion.checkEq = function (por1, por2) {
//     let attrs = ['_id', 'name', 'rank']
//     return _.all(attrs, attr => por1[attr] === por2[attr])
// }


// ================== PORTIONS =======================

export const Portions = types.model("Portions", {
    portions: types.array(Portion, []),
})
.actions(self => {
    let _db

    return {
        load: () => {
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
            //console.log('portions apply', doc._id)

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
                if (idx < 0) throw new Error(`Portion not found [${doc._id}]`)

                self.portions[idx].apply(doc)
                return
            }

            let name = parts[0]
            let portion = _.findWhere(self.portions, { name })
            if (!portion) {
                //!!! error
                return
            }

            portion.apply(doc)
        },

        setDb: (db) => { _db = db },

        getDb: () => { return _db },

        movePortion: (_id, newIndex, cb) => {
            _move(_db, self.portions, _id, newIndex, cb)
        },

        removePortion: (_id, cb) => {
            _remove(_db, self.portions, _id, cb)
        },

        addPortion: (name, cb) => {
            let err = self.checkName(name)
            if (err) {
                cb && cb(err)
                return
            }

            let _id = `#item/${name}/portion`
            let doc = { _id, name, passages: [] }
            _add(_db, doc, self.portions, cb)
        },

        checkName: (name) => {
            return _invalidNameCheck(name) || _duplicateCheck(self.portions, name)
        }, 

    }
})
// .views(self => ({
// }))

