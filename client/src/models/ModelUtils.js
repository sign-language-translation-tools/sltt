import { detach } from "mobx-state-tree"
import _ from 'underscore'

// Insert doc into a list of items ranked by named attribute.
export function _insertBy(doc, list, orderedBy) {
    // If element with doc._id already present, no insert necessary
    if (doc._id && _.findWhere(list, {_id: doc._id})) return

    let idx = _.findIndex(list, element => doc[orderedBy] < element[orderedBy])
    if (idx >= 0) {
        list.splice(idx, 0, doc)
        return list[idx]
    } else {
        list.push(doc)
        return _.last(list)
    }
}

// Return a promise to remove all items whose id starts with _id.
export function removeFromDB(db, _id) {
    return new Promise((resolve, reject) => {
        let options = {
            include_docs: true,
            startkey: _id,
            endkey: _id + '\uffff'
        }

        db.allDocs(options)
            .then(response => {
                console.log(`removeFromDB ${_id}, count=${response.rows.length}`)
                
                let docs = _.map(response.rows, row => {
                    return {
                        _deleted: true,
                        _id: row.doc._id,
                        _rev: row.doc._rev,
                    }
                })

                return db.bulkDocs(docs)
            })
            .then(resolve)
            .catch(err => {
                reject(`ModelUtils#removeFromDB(${_id}): ${err}`)
            })
    })
}

// Remove an item from the list and update the project database to reflect this.
export function _remove(db, list, _id, cb) {
    let idx = _.findIndex(list, {_id})
    if (idx < 0) {
        cb(`_remove: cannot find ${_id}`)
        return
    }
    // we need to use detach rather than splice here because
    // splice immediately makes the object inaccessible and it is hard to
    // stop react from accessing it in that state and crashing
    detach(list[idx])

    // Match this item all its subitems (if any).
    // E.g. for the portition #item/Progigal Son/portion
    // we also want to match the passage #item/Prodigal Son/Part 1/passage

    removeFromDB(db, _id)
        .then(() => cb && cb())
        .catch(err => cb && cb(err))
}
