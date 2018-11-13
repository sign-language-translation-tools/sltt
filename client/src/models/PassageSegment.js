/*
PassageVideos may be divided into segments.
Each segment can optionally have labels which will be shown while that segment is playing.
A segment may also have a extended caption.
 */

import { types, getParent, getSnapshot } from "mobx-state-tree"
const log = require('debug')('sltt:PassageSegment') 


/*

stage 1 - edit/display single label
      2 - multiple labels
      3 - play/pause segment
      4 - play/pause previous revision
      5 - CC field (include dictate)

when you create a video make sure it is named in '1 of 2'
when you delete 2 of 2 show 1 of 1
should not allow this while editing labels either
wbn if 'enter' closed label editor
make label edit field narrower so it does not wrap

verify passagesegment tests still work
test (mark the first few verses in the video)
record demo???

push to git, server
===================

play segment UI
play segment
play segment from previous revision

add cc
edit cc
dictate cc (while playing)
delete cc

add to tour

drag to adjust ration between middle and right pane
 */

export const PassageSegmentLabel = types.model("PassageSegmentLabel", {
    x: types.number, // % position, 0 = left
    y: types.number, // % position, 0 = top
    text: types.string,
})
.actions(self => ({
}))


export const PassageSegment = types.model("PassageSegment", {
    _id: types.string,
    videoCreated: types.string,  // time that the video this segment is a part of was created
    segmentCreated: types.string,   // time this segment was created
    position: types.number,   // time offset in video to start of segment
    labels: types.array(PassageSegmentLabel), 
    cc: types.optional(types.string, ''),  // closed caption
})
.actions(self => ({
    getPassage: () => getParent(self, 4),

    // We have received from PouchDB and updated version of a doc for self.
    // Copy the fields that might have changed value.
    apply: (doc) => {
        self.position = doc.position
        self.labels = doc.labels
        self.cc = doc.cc
    },

    _setLabels: (labels, cb) => {
        self.labels = labels

        let _setLabels = (doc => {
            doc.labels = labels
            return doc
        })

        self.upsert(_setLabels, cb)
    },

    // If cb = null, returns a promise.
    // Otherwise executes request as a call back.
    setLabels: (labels, cb) => {
        if (cb)
            return self._setLabels(labels, cb)

        return new Promise((resolve, reject) => {
            self._setLabels(labels, err => {
                if (err) {
                    reject(err)
                    return
                }

                resolve()
            })
        })
    },

    _upsertPosition: (position, cb) => {
        self.position = position

        let _setPosition = (doc => {
            doc.position = position
            return doc
        })

        self.upsert(_setPosition, cb)
    },

    // If cb = null, returns a promise.
    // Otherwise executes request as a call back.
    upsertPosition: (position, cb) => {
        if (cb)
            return self._upsertPosition(position, cb)

        return new Promise((resolve, reject) => {
            self._upsertPosition(position, err => {
                if (err) {
                    reject(err)
                    return
                }

                resolve()
            })
        })
    },

    // Upsert invokes the setter and tries to update PouchDb.
    // If there is a collision with someone else trying to update the same record
    // it will get the updated version of the record, re-execute the setter,
    // and try to update again.

    upsert: (_setter, cb) => {
        let db = self.getPassage().getPortion().getDb()
        let snapshot = getSnapshot(self)
        log('upsert', snapshot)

        db.upsert(self._id, _setter)
            .then(() => cb && cb())
            .catch(err => {
                log(`upsert error`, err)
                cb && cb(err)
            })
    }
}))
