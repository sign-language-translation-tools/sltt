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

    db.get(_id)
        .catch(err => {
            cb && cb(`could not GET [${_id}] to remove it [${err}]`)
        })
        .then(doc => {
            doc._deleted = true
            return db.put(doc)
        })
        .then(() => cb && cb())
        .catch(err => { 
            cb && cb(`could not PUT [${_id}] to remove it [${err}]`) 
        })
}
