import { types, getParent, detach } from "mobx-state-tree"
import _ from 'underscore'
import { _insertBy, _remove } from './ModelUtils.js'

import { checkStatus, pushFile, concatBlobs, getUrl } from './API.js'
import { user } from '../components/auth/User.js'
import { deletedStatus } from './PassagesStatus.js'
import { PassageSegment } from './PassageSegment.js'

const log = require('debug')('sltt:Passages') 

let previousDate = new Date()

function formatTimestamp(date) {
    let ts = date.toISOString().slice(0, 19)
    ts = ts.replace(/:/g, '.')
    ts = ts.replace('T', ' ')
    return ts
}

// Generate a timestamp. Make sure it is not same as previously generated timestamp.
export const timestamp = function() {
    let nextDate = new Date()
    if (nextDate - previousDate < 1000) {
        nextDate = new Date(previousDate.getTime() + 1000)
    }
    previousDate = nextDate
    return formatTimestamp(nextDate)
}

function uploadTimestamp(file) {
    return formatTimestamp(new Date(file.lastModified))
}

// Before you can play a video you have to get a signed S3 url for the video.
// This url has an expiration date.
// If you already have a signed url for this object and it has not expired,
// use the existing url.
// Otherwise fetch a signed url for the video from the server.
// videoObject is a PassageNoteSegment or VideoPassage

function fetchSignedUrl(projectName, videoObject, cb) {
    let { url, signedUrl, signedUrlExpires } = videoObject
    const now = Date.now() / 1000
    //log(`fetchSignedUrl url=${url}, signedUrl=${signedUrl}, signedUrlExpires=${signedUrlExpires}, now=${now}`)

    if (signedUrl && signedUrlExpires && signedUrlExpires > now) {
        //log(`fetchSignedUrl REUSING signedUrl`)
        cb && cb(null, signedUrl)
        return
    }

    getUrl(projectName, url)
        .then(signedUrl => {
            log(`fetchSignedUrl REFRESHED url=${signedUrl.slice(0,80)}`)

            let match = signedUrl.match(/(X-Amz-Expires)=(\d+)/)
            let expiresIn = (match && parseInt(match[2], 10)) || 3500

            videoObject.setSignedUrlHelper(signedUrl, now + expiresIn - 10)
            cb && cb(null, signedUrl)
        })
        .catch(
            err => { 
                log('fetchSignedUrl ERR', err)
                cb && cb(err) 
            }
        )
}

// A PassageNoteSegment represents one comment in a note thread.
// The comment can be a video with a 'duration' and 'url'.
// The comment can be textual with 'text' (draft-js content)

export const PassageNoteSegment = types.model("PassageNoteSegment", {
    _id: types.string,
    videoCreated: types.string,
    noteCreated: types.string,
    segmentCreated: types.string,
    username: types.string,
    position: types.number,
    duration: types.number,
    url: types.string,
    signedUrl: types.optional(types.string, ''),    
    signedUrlExpires: types.optional(types.number, 0),    
    text: types.optional(types.string, ''),

    // videoCreated, noteCreated, segmentCreated, username, position, duration, text, url, 
})
.actions(self => ({
    // Get the signedUrl for this note segment video into the signedUrl attribute.
    // If cb is passed, do this as a callback.
    // Otherwise return a promise.

    getSignedUrl: cb => {
        let projectName = self.getPassage().getPortion().getProject().name
        
        if (cb) {
            fetchSignedUrl(projectName, self, cb)
            return null
        }

        return new Promise((resolve, reject) => {
            fetchSignedUrl(projectName, self, err => {
                if (err) reject(err)
                else resolve(self.signedUrl)
            })
        })
    },

    getPassage: () => {
        let passage = getParent(self, 4)
        return passage
    },

    setSignedUrlHelper: (signedUrl, signedUrlExpires) => {
        self.signedUrl = signedUrl
        self.signedUrlExpires = signedUrlExpires
    },
}))


export const PassageNote = types.model("PassageNote", {
    noteCreated: types.identifier(),
    videoCreated: types.string,
    position: types.number,
    segments: types.array(PassageNoteSegment), 
    resolved: types.boolean,
})
.actions(self => ({
    getSignedUrls: (cb) => {
        log(`getSignedUrls count=${self.segments && self.segments.length}`)
        let _gets = _.map(self.segments, segment => segment.getSignedUrl())
        Promise.all(_gets)
            .then(() => {cb && cb()})
            .catch(err => {cb && cb(err)})
    },

    apply: (doc) => { 
        if (doc.tag === 'resolved') {
            self.resolved = true
            return
        }

        let { segmentCreated } = doc
        let segment = _.findWhere(self.segments, { segmentCreated })
        if (segment) return   // Segment already exists in note, nothing to do

        _insertBy(doc, self.segments, 'segmentCreated')
    },

    resolve: (cb) => {
        if (self.resolved) {
            cb && cb()
            return
        }

        self.resolved = true

        let doc = {
            videoCreated: self.videoCreated,
            noteCreated: self.noteCreated,
            position: self.position,
            segmentCreated: timestamp(),
        }

        let passage = getParent(self, 2)
        passage.setId(doc, 'resolved')
        passage.put(doc, cb)        
    },

    addSegment: (doc, cb) => {
        let passage = getParent(self, 2)
        passage.setId(doc, 'notesegment', 'webm')
        self.insertSegment(doc)
        passage.put(doc, cb)
    },

    getDb: () => {
        let passage = getParent(self, 2)
        let _db = passage.getPortion().getDb()
        return _db
    },

    insertSegment(doc) {
        _insertBy(doc, self.segments, 'segmentCreated')
    },

    removeSegment: (_id, cb) => {
        let _db = self.getDb()
        _remove(_db, self.segments, _id, cb)
    },
}))

export const PassageStatus = types.model("PassageStatus", {
    statusCreated: types.string,
    videoCreated: types.string,
    status: types.number,
})
.actions(self => ({
    setStatusCreated: statusCreated => {
        self.statusCreated = statusCreated
    },
}))


export const PassageVideo = types.model("PassageVideo", {
    _id: types.identifier(),
    username: types.string,
    videoCreated: types.string,
    duration: types.number,
    url: types.string,
    signedUrl: types.optional(types.string, ''),
    signedUrlExpires: types.optional(types.number, 0),    
    segments: types.optional(types.array(PassageSegment), []),
        // key 'segmentCreated'
        // ordered by 'position' ascending
})
.actions(self => ({

    // Get the signedUrl for this video into the signedUrl attribute.
    // If cb is passed, do this as a callback.
    // Otherwise return a promise.
    getSignedUrl: (cb) => {
        let projectName = self.getPassage().getPortion().getProject().name

        if (cb) {
            fetchSignedUrl(projectName, self, cb)
            return null
        }

        return new Promise((resolve, reject) => {
            fetchSignedUrl(projectName, self, err => {
                if (err) reject(err)
                else resolve(self.signedUrl)
            })
        })
    },

    getPassage: () => {
        return getParent(self, 2)
    },

    setStatus: status => {
        self.getPassage().setStatus(self, status)
    },

    setSignedUrlHelper: (signedUrl, signedUrlExpires) => {
        self.signedUrl = signedUrl
        self.signedUrlExpires = signedUrlExpires
    },

    // Add a single segment
    __addSegment(position, cb) {
        let { videoCreated } = self
        let passage = self.getPassage()

        let doc = {
            videoCreated,
            segmentCreated: timestamp(),
            position,
            labels: [
            ],
            cc: '',
        }
        passage.setId(doc, 'segment')
        self.applySegment(doc)

        passage.put(doc, cb)
    },

    _addSegment: (position, cb) => {
        // Ensure that there is always a segment at position 0 so that no matter where
        // you go in the timeline some segment is present
        if (self.segments.length === 0 && position !== 0) {
            self.__addSegment(0, err => {
                if (err) {
                    cb && cb(err)
                    return
                }

                self.__addSegment(position, cb)
            })

            return
        }

        self.__addSegment(position, cb)
    },

    addSegment: (position, cb) => {
        log(`PassageVideo.addSegment position=${position}`)
        if (cb)
            return self._addSegment(position, cb)
            
        return new Promise((resolve, reject) => {
            self._addSegment(position, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    },

    _removeSegment: (segmentCreated, cb) => {
        log(`PassageVideo.removeSegment`, segmentCreated)

        let segment = _.findWhere(self.segments, {segmentCreated})
        if (!segment) {
            log('_removeSegment: segment not found')
            cb && cb('segment not found')
            return
        }

        let db = self.getPassage().getPortion().getDb()
        _remove(db, self.segments, segment._id, cb)
    },

    removeSegment: (segmentCreated, cb) => {
        if (cb)
            return(self._removeSegment(segmentCreated, cb))

        return new Promise((resolve, reject) => {
            self._removeSegment(segmentCreated, err => {
                if (err) reject(err)
                else resolve()
            })
        })
    },

    applySegment: doc => {
        //log('PassageVideo.applySegment', doc)
        let idx = _.findIndex(self.segments, seg => seg.segmentCreated === doc.segmentCreated)
        if (idx >= 0) {
            self.segments[idx].apply(doc)
            return
        }

        // It does not matter what order the segments are in in the array because 
        // sortedSegments can be used in cases where you need to see them in position
        // order.
        self.segments.push(doc)
    },
}))
.views(self => ({
    get sortedSegments() {
        return self.segments
            .sort((a, b) => a.position - b.position)
    },

    get created() {
        return self.videoCreated.slice(0, -3)
    },

    get status() {
        // Statuses is an array of status setting transactions.
        // Setting a status appends a new transaction to the array.
        // We do this because offline operation is made more stable by only adding to the
        // data model, never changing an existing item.
        // Because of this we have to find the latest transaction correspond to this videoPassage.

        let statuses = self.getPassage().statuses
        statuses = _.where(statuses, {videoCreated: self.videoCreated})
        if (statuses.length === 0) return 0

        statuses = _.sortBy(statuses, 'statusCreated')
        return _.last(statuses).status
    },

    get isLatest() {
        let passage = self.getPassage()
        let last = _.last(passage.videos)
        return self._id === last._id
    },
}))

export const Passage = types.model("Passage", {
    _id: types.identifier(),
    name: types.string,
    rank: types.number,
    statuses: types.array(PassageStatus),
    notes: types.array(PassageNote),
    videos: types.array(PassageVideo),
})
.actions(self => ({
    videod: () => self.videos.length > 0,

    getPortion: () => getParent(self, 2),

    //!! Need a unit test case for this.
    uploadFile: (file, onprogress, cb) => {
        let portion = self.getPortion()
        let projectName = portion.getProject().name
        let videoCreated = uploadTimestamp(file)

        let path = `${portion.name}/${self.name}/${videoCreated}`

        pushFile(file, projectName, path, onprogress)
            .then(checkStatus)
            // WARNING, if I replace the following with just '.then(concatBlobs(...)')
            // it does not invoke concatBlobs promise.
            // Perhaps that means you have to return a Promise to get it invoked.
            // You cannot just pass a Promise to then(...) ???
            .then(() => concatBlobs(projectName, path, 1))
            .then(checkStatus)
            .then(response => response.text())
            .then(url => {
                let doc = {
                    username: user.username,
                    videoCreated,
                    duration: 0, // We don't know the duration yet of an uploaded video
                    url,
                }

                self.setId(doc, 'video', 'mp4')
                self.pushVideo(doc)

                return self.putPromise(doc)
            })
            .then(() => {
                cb()
            })
            .catch(err => { 
                cb(err) 
            })
    },

    pushVideo: (doc) => {
        self.videos.push(doc)
    },

    putPromise: (doc) => {
        return new Promise((resolve, reject) => {
            log('putPromise', doc)
            self.put(doc, err => {
                if (err) {
                    reject(err)
                    return
                }

                log('putPromise resolve')
                resolve()
            })

        })
    },

    // Set _id field of doc
    setId: (doc, tag, ext) => {
        let portion = self.getPortion()
        let _id = `${portion.name}/${self.name}`

        _id += '/' + doc.videoCreated
        if (doc.statusCreated)
            _id += ' ' + doc.statusCreated
        if (doc.noteCreated)
            _id += ' ' + doc.noteCreated
        if (doc.segmentCreated)
            _id += ' ' + doc.segmentCreated
        if (ext)
            _id += '.' + ext

        _id += `/${tag}`
        doc._id = _id
        doc.tag = tag
    },

    put: (doc, cb) => {
        log('PUT', doc._id)

        let portion = self.getPortion()
        let db = portion.getDb()
        db.put(doc)
          .then(() => { 
              cb && cb() 
          })
          .catch(err => { 
              cb && cb(err)
          })
    },

    setStatus: (passageVideo, status, cb) => {
        if (passageVideo.status === status) {
            cb && cb()
            return
        }

        let doc = {
            statusCreated: timestamp(),
            videoCreated: passageVideo.videoCreated,
            status,
        }
        self.statuses.push(doc)

        //log('setStatus')
        //_.forEach(self.statuses, s => log(s))
        
        self.setId(doc, 'status')
        self.put(doc, cb)
    },

    addVideo: (doc, cb) => {
        // doc: { username, videoCreated, duration, url }
        log('addVideo', doc.duration, doc.url)
        //!! ensure that videoCreated is later than existing videos

        self.setId(doc, 'video', 'webm')
        self.videos.push(doc)

        self.put(doc, err => {
            if (err) {
                cb && cb(err)
                return
            }
            cb && cb(null, self.videos.slice(-1)[0])
        })
    },

    // Add a new note to this passage.
    // doc is actually the first segment to add to the new note.
    addNote: (doc, cb) => {
        let note = self.findOrCreateNote(doc)
        note.addSegment(doc, cb)
    },

    pushNote: note => {
        self.notes.push(note)
    },

    apply: (doc) => {
        //log('passages apply', doc)
        
        let { noteCreated, _deleted } = doc

        if (_deleted) {
            if (noteCreated)
                self.applyDeleteNoteSegment(doc)
            return
        }
    
        let note
        if (noteCreated) note = self.findOrCreateNote(doc)
        
        switch (doc.tag) {
            case 'video': self.applyVideo(doc); break
            case 'status': self.applyStatus(doc); break
            case 'segment': self.applySegment(doc); break
            case 'notesegment': note.apply(doc); break
            case 'resolved': note.apply(doc); break
            default: throw new Error(`Invalid tag: ${doc.tag}`)
        }
    },

    applyDeleteNoteSegment(doc) {
        let { noteCreated, segmentCreated } = doc
        let note = _.findWhere(self.notes, { noteCreated })
        if (!note) return

        let idx = _.findIndex(note.segments, { segmentCreated })
        if (idx < 0) return

        // we need to use detach rather than splice here because
        // splice immediately makes the object inaccessible and it is hard to
        // stop react from accessing it in that state and crashing
        detach(note.segments[idx])
    },

    applyVideo: (doc) => {
        let { videoCreated } = doc
        let video = _.findWhere(self.videos, { videoCreated })
        if (video) return   // Video already exists, nothing to do

        _insertBy(doc, self.videos, 'videoCreated')
    },

    applyStatus: (doc) => {
        let { statusCreated } = doc
        let status = _.findWhere(self.statuses, { statusCreated })
        if (status) return   // Status already exists, nothing to do

        _insertBy(doc, self.statuses, 'statusCreated')
    },

    applySegment: (doc) => {
        let videos = self.videos.filter(video => video.videoCreated >= doc.videoCreated)

        // I am assume that the order of entries in the db will ensure that we never see
        // a segment entry before we see the passage video
        if (videos.length === 0) throw Error('no video found for segment')

        videos.forEach(video => video.applySegment(doc))
    },

    findOrCreateNote: (doc) => {
        let { noteCreated } = doc
        let note = _.findWhere(self.notes, { noteCreated })
        if (note) return note

        let noteDoc = {
            videoCreated: doc.videoCreated,
            noteCreated: doc.noteCreated,
            position: doc.position,
            segments: [],
            resolved: false,
        }

        _insertBy(noteDoc, self.notes, 'position')
        
        note = _.findWhere(self.notes, { noteCreated })
        return note
    },

}))
.views(self => ({
    get status() {
        let lastPasageVideoStatus = _.last(self.statuses)
        return (lastPasageVideoStatus && lastPasageVideoStatus.status) || 0
    },

    get videosNotDeleted() {
        let videos = self.videos || []
        
        //log('videos pre', videos.map(pv => `${pv.videoCreated}|${pv.status}`), deletedStatus)
        videos = _.filter(videos, pv => pv.status !== deletedStatus)
        //log('videos post', videos.map(pv => `${pv.videoCreated}|${pv.status}`))
        return videos
    }
}))

