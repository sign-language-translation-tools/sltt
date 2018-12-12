import { types, getParent, /* getSnapshot, onSnapshot, onPatch, */ applySnapshot } from "mobx-state-tree"
import _ from 'underscore'

const debug = require('debug')('sltt:Members') 


export const Member = types.model("Member", {
    //id: types.string,
    email: types.string,
    role: types.enumeration(['admin', 'translator', 'consultant', 'observer']),
})
.actions(self => ({
    setRole: (role, cb) => { 
        debug(`setRole ${self.email}/${role}`)
        let members = getParent(self, 2)
        members.setRole(self.email, role, cb)
    },

    delete: (cb) => {
        debug(`delete ${self.email}`)
        let members = getParent(self, 2)
        members.delete(self.email, cb)
    }
}))


export const Members = types.model("Members", {
    items: types.array(Member, []),
    _id: 'members',
})
.actions(self => {
    // let _rev
    let _db 

    return {
        // afterCreate: () => { },

        apply: doc => {
            if (doc._id !== self._id) return
            applySnapshot(self, doc)
        },

        getProject() {
            return getParent(self, 1)
        },

        getProjectName: () => {
            try {
                return self.getProject().name
            } catch (err) {
                return '*unknown*'
            }
        },

        initDb: () => {
            if (!_db) _db = self.getProject().getDb()
        },

        load: () => {
            debug(`[${self.getProjectName()}] load`)
            self.initDb()

            return new Promise ((resolve, reject) => {
                debug(`[${self.getProjectName()}] get`)

                _db.get(self._id)
                   .then(doc => {
                       debug(`[${self.getProjectName()}] applySnapshot`)
                        // _rev = doc._rev
                        applySnapshot(self, doc)
                        resolve(doc)
                   })
                   .catch(err => {
                       debug(`[${self.getProjectName()}] *** load error ${err}`)
                       reject(err)
                   })
            }) 
        },

        setItems: (items) => { self.items = items },

        // Add a new member.
        add: (email, cb) => {
            debug(`[${self.getProjectName()}] add ${email}`)
            self.initDb()

            email = email.trim()
            let err = self.canAdd(email)
            if (err) {
                if (cb) {
                    debug(`[${self.getProjectName()}] *** add error = ${err}`)
                    cb(err)
                    return
                }
                
                throw Error(err)
            }

            let member = {email, role: 'translator'}

            let add = (doc => {
                if (_.findWhere(doc.items, {email})) return false
                doc.items.push(member)
                self.setItems(doc.items)
                return doc
            })

            _db.upsert('members', add)
               .then(() => { cb && cb() })
               .catch(err => {
                   debug(`[${self.getProjectName()}] *** add upsert error = ${err}`)
                   cb && cb(err)
                })
        },

        // Check that email is not a duplicate
        canAdd: (email) => {
            email = email.trim()
            return self.isDuplicateEmail(email)
        }, 

        isDuplicateEmail: (email) => {
            email = email.trim()
            let existing = _.pluck(self.items, 'email')
            
            if (_.indexOf(existing, email) >= 0)
                return 'Duplicate email address'
            
            return null
        },

        delete: (email, cb) => {
            debug(`[${self.getProjectName()}] delete ${email}`)
            self.initDb()
            email = email.trim()
            
            let deleteMember = (doc => {
                let idx = _.findIndex(doc.items, {email})
                if (idx < 0) return false
                
                doc.items.splice(idx, 1)  // remove one item
                self.setItems(doc.items)
                return doc
            })
            
            _db.upsert('members', deleteMember)
            .then(() => { cb && cb() })
            .catch(err => {
                debug(`[${self.getProjectName()}] *** delete upsert error = ${err}`)
                cb && cb(err)
            })
        },

        setRole: (email, role, cb) => {
            self.initDb()
            email = email.trim()
            
            let _setRole = (doc => {
                let idx = _.findIndex(doc.items, {email})
                if (idx < 0) return false
                
                doc.items[idx].role = role
                self.setItems(doc.items)
                return doc
            })
            
            _db.upsert('members', _setRole)
            .then(() => { cb && cb() })
            .catch(err => {
                debug(`[${self.getProjectName()}] *** setRole upsert error = ${err}`)
                cb && cb(err)
            })
        }
    }
})
