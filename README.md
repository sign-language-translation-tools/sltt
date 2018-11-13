The SLTT system consists of a client running in a browser and a backend server running on a Linux machine. Only the chrome browser is currently supported. We might in the future support a standalone version of the client using Electron or a similar package.

Windows and OSx are supported.

# Guided Tour

Slideshow [HERE](https://docs.google.com/presentation/d/1gtVRTaFyQt9BM49vmk4WHVtOAsKy7F1ITBKRj9ram58/edit?usp=sharing)

# System Overview

![Diagram](http://sign-language-translation-tools.github.io/sltt/overview.png)

<dl>
  <dt>Portion</dt>
    <dd>A group of related video passages. Typically all the videos for a book or a story.</dd>
<br/>
  <dt>Passage</dt>
    <dd>A video. Typically a section of a chapter or a story. Usually all drafts of the passage are retained.</dd>
</dl>

# Client

The client is built with React UI components. It displays information found in two state models: Project State and Video State.

## Project State

This is persistent information about a single translation project. This includes the following

* A list of portions and their video passages
* Videos for the drafts of each passage. Review status of each passage.
* Video or written notes for passages
* List of members and their roles in the project

This is stored as a tree of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) objects. Any React compnent wrapped in the `mobx-react` component will be reactively re-rendered whenever any data which the component uses from the Project State object changes.

Initially this information is read from the project PouchDB database on the server. Any changes made to this data by this client or any other client accessing this project on the server are automatically sent to the client causing the project state model to be updated and triggering a re-rendering of the information in the React components.

### Project State Data Model

```
Project
    name
    members
        Member
            email
            role (admin/translator/consultant/observer)
    portions
        Portion
            name
            rank (determines display sequence)
            passages
                Passage
                    name
                    rank
                    videos
                        PassageVideo
                            username
                            videoCreated (creation timestamp for passage video)
                            duration (of recorded video)
                            url (S3 url of video file)
                    statuses
                        PassageStatus
                            statusCreated (creation timestamp for this status entry)
                            videoCreated (creation timestamp for passage video this note applies to)
                            status (review status)
                    notes
                        PassageNote
                            videoCreated (creation timestamp for passage video this note applies to)
                            noteCreated (note creation timestamp)
                            position (time offset of note in passage video)
                            resolved (boolean - no further action needed on note)
                            segments
                                PassageNoteSegment (represents one comment in a note thread)
                                    segmentCreated (creation timestamp for segment)
                                    username
                                    [video thread comments only]
                                    duration
                                    url (S3 url of video file for this thread segment video)
                                    [text thread comments only]
                                    text (text of comment in draft-js content format)

```

## PouchDB Database Items

Each project is stored in a separate PouchDB database contained in a single directory on the server.
The name of the database is the same as the name of the project.
In order to avoid needing to deal with update conflicts when multiple people update the same information
most of the documents in our database are intentionally immutable once written.

### Portion (mutable/deletable)

This document names a portion in a project.
The rank field gives the display order of the portions in a project.

This document is deleted when the portion is deleted from the project.
This document may be updated with a different value in the rank field when the order of this portion in the project is changed ... since this likely happens fairly rarely and the only thing that can collide is changes to the rank field, it is probably not worthwhile to create a separate document type just to record changes. 
We just overwrite the original document.

_id for document

    #item/<portion name>/<passage name>/portion

Example document

    {
        _id: "#item/El Fariseo y El Publicano/portion",
        name: "El Fariseo y El Publicano",
        rank: 200,  // an arbitrary number used for sorting/ordering portions
    }

### Passage (mutable/deletable)

This document names a passage within a portion in a project.
The rank field gives the display order of the passage in the portion.

This document is deleted when the passage is deleted from the portion.
This document may be updated with a different value in the rank field when the order of this passage in the portion.
See the Portion section above for why this object is mutable.

_id for document

    #item/<portion name>/<passage name>/passage

Example document

    {
        _id: "#item/Hijo Prodigo/Partido Uno/passage",
        name: "Partido Uno",
        rank: 100,
    }

### Video (immutable)

This document type contains the information for a video draft for a passage. 
These entries are never modified or deleted.
A draft may be hidden from view by creating Video Status entry with status 'PassagesStatus.deletedStatus'.
See the next section for information on Video Status.

_id for document

    <portion name>/<passage name>/<video creation time>.<file extension>/video


Example document

    { 
        _id: "El Fariseo y El Publicano/test/2018-10-01 20.15.30.webm/video",
        videoCreated: "2018-10-01 20.15.30", 
        username: "milesnlwork@gmail.com",
        duration: 301.99,
        url: "LSPeru/El_Fariseo_y_El_Publicano/test/2018-10-01_20.15.30.webm",
            // This is the name of the file in the S3 bucket
    }

### Video Status (immutable)

This document type contains the information about the review status of a video draft for a passage. 
These documents are never modified or deleted.
The status of a video draft is changed by creating a new status entry with a later 'statusCreated' date 
than the previous entry.

A status of 1 indicates that the video has passed the first review stage.
A status of PassagesStatus.deletedStatus (10) means the video is in the trash can and should be hidden from view.
We do not actually delete the video. (We don't yet have UI to get the video back out of the trashcan)

_id for document

    <portion name>/<passage name>/<video creation time> <status set time>/status


Example document

    {
        _id: "El Fariseo y El Publicano/test/2018-10-01 20.15.30 2018-10-01 20.15.41/status",
        videoCreated: "2018-10-01 20.15.30",
        statusCreated: "2018-10-01 20.15.41",
        status: 2,
    }

### Video Note Segment (immutable)

Notes are made up of note segments.
Each segment is a comment authored by a project member.
A segment is either styled text or a sign language video.
There is not a separate document for the note; instead a note consists of all the note segments
with the same \<portion name\>/\<passage name\>/\<video created time\> \<note created time\>.
These documents are never modified or deleted.

Creation of a Video Note Resolve document, see next section, causes a note to be hidden.

_id for document

    <portion name>/<passage name>/
        <video creation time> <note creation time> <note segment creation time>/notesegment

Example document

    {
        _id: "Hijo Prodigo/Abigail/2018-07-25 15.42.33 2018-07-31 20.39.21 2018-07-31 20.39.24.webm/notesegment",
        segmentCreated: "2018-07-31 20.39.24",
        videoCreated: "2018-07-25 15.42.33",
        noteCreated: "2018-07-31 20.39.21",
        username: "milesnlwork@gmail.com",
        position: 8.104878,  // time offset for location of note in video passage draft
        duration: 98.918,
        url: "LSPeru/Hijo_Prodigo/Abigail/2018-07-25_15.42.33.2018-07-31_20.39.21.2018-07-31_20.39.24.webm",
    }

### Video Note Resolved (immutable)

This document is created whenever a note is resolved. 
For now at least resolved notes are hidden from the user (eventually we will have UI to reshow them in
order to allow the user to see resolved notes).        
These documents are never modified or deleted.

_id for document

    <portion name>/<passage name>/
        <video creation time> <note creation time> <note resolution time>/resolved

Example document

    {
        _id: "Hijo Prodigo/Segundo Partido/2018-07-25 15.42.33 2018-08-02 14.09.38 2018-08-02 16.52.05/resolved",
        videoCreated: "2018-07-25 15.42.33",
        noteCreated: "2018-08-02 14.09.38",
        segmentCreated: "2018-08-02 16.52.05",   // time note resolved
        position: 97.122859,
    }


## React Components Hierarchy

![Components Hierarchy](http://sign-language-translation-tools.github.io/sltt/components.png)

```
SLTool
    Router
    NavigationBar - select major mode (translation editor, portions editor, members editor)
        GoogleLogin
    ProjectsTabs
        Tabs
            TabList
                Tab
        TabPanel
            TranslationEditor - translation editing mode see details at (A) below
    PortionsEditor - Add, remove, reorder portions
        SortableList
            SortableItem
                DragHandle
                PortionView
                    PortionEditor
        PortionAdder
    MembersEditor - add/remove members, change member roles
        Member
            MemberRole
        MemberAdder
    DatabaseEditor - debugging view, root users only
        RowView

TranslationEditor (A)
    PassageList - select project portion, add/remove/reorder passages in portion
        PortionSelector
        SortableList
            SortableItem    
                DragHandle
                Passage
                    PassageEditor - edit name of passage
                    Progress - show progress of upload after drag and drop
        PassageAdder
    VideoMain
        VideoToolbar
            (Play|Pause|Record|Stop|CreateNote)Button
            PassageVideoSelector - select which draft of video to play
            PassageStatusSelector - set review status for selected draft
        VideoRecorder
        VideoPlayer
        VideoMessage - tell user why there is nothing available to play
        VideoPositionBar - adjust time position in video
            AdjustCurrentTimeButtons
        NoteBar - show notes for current video
    TranslationRightPane
        PassageSegmentsEditor
            SegmentLabels - show the labels for current segment
                SegmentLabelsEditor - edit labels for current segment
                    LabelTextEditor
            SegmentPosition - show start position of current segment
                SegmentPositionEditor - edit start position of current segment
    NoteDialog - edit video note
        NoteMain
            VideoPlayer
            VideoRecordingToolbar
            VideoRecorder
            NoteSegment - show a video or textual note chat segment
                NoteTextEditor - edit text segment
                    Editor
```

## Video State

This is **nonpersistent** information concerning what video passage has currently been selected and what the state of the video display is e.g. playing, recording, stopped, etc.

This is stored as a [MobX](https://github.com/mobxjs/mobx) object. Any React wrapped in the `mobx-react` component will be reactively re-rendered whenever any data which the component uses from the Video State object changes.

## Google OpenId Authentication

Users may log into the client using their Gmail identity based on the support described at developers.google.com/identity/sign-in/web/reference. This login returns a JWT containing their identity information. This JWT is passed to the server to validate each request.

## DBS Octopus Authentication

Users on DBS related projects may log in to the client using their DBS Octopus system of login credentials. This will result in a JWT which will be used to validate each request to the server. This has not been implemented yet.

# Server

## Nginx Reverse Proxy

The reverse proxy performs the following functions

* Examines the requesting URL to determine the desired server, i.e. sltt.paratext.org versus sltt-dev.paratext.org. Currently only sltt.paratext.org is running.
* Translates https requests to http requests and forwards them to the correct internal server.

## Express.js

**index.js**: Express.js is used to process the incoming HTTP requests from the client.

## Authentication

**authentication.js**: The JWT is extracted from the authorization header and cryptographically validated. The e-mail address field for the user is extracted and attached to the `req` structure. Requests with invalid or absent JWTs are rejected.

## Authorization

**getMembers.js**: Retrieves a list of valid members for the project named in the request from the PouchDB database. This information includes the project role for each user.

Roles: 

* *observer* - Can view videos and notes but cannot create them.
* *consultant* - Can view videos but not create them. Can view and create notes.
* *translator* - Can view and create videos and notes.
* *admin* - Can view and create videos and notes. Can add and remove members from project and change their roles.

**authorization.js**: The user's role in the project is determined based on their e-mail address. Requests from e-mail addresses not authorized for this project are rejected. 

If the user does not have an admin role in the project and the request seeks to modify the members of the project or the roles, the request is rejected.

## projects

**projects.js**: Return a list of project names which the current user is authorized to see.

## PouchDB

[PouchDB](https://pouchdb.com/) is an open-source JavaScript database inspired by Apache CouchDB that is designed to run well within the browser. Currently only an adapter runs in the browser and attaches it to the database running in the server. Changes made by any client are pushed to all other connected clients in real-time.

PouchDB was created to help web developers build applications that work as well offline as they do online. This is important because some locations have unreliable internet access.

PouchDB is used to store all the information from the Project State structure. There is one PouchDB database per project.

## push

**pushBlob.js**: The HTML 5 video recording support produces a series of small binary blobs when recording. Each blob is sent separately to the server. Sending them as they are produced minimizes the amount of time between the video recording finishing and the full video been uploaded to the server. These blobs are stored in temporary files on the server. 

## concat

**concatBlob.js**: After all blobs in the video have been uploaded they are concatenated together into a single blob containing the entire video and this blob is uploaded directly from the server to Amazon S3. After the data has been pushed to Amazon S3 the temporary files are deleted.

## url

**getUrl.js**: in order for the client to play an existing video passage a signed URL for this video must be generated by Amazon S3. The signed URLs have a limited lifespan so they are generated on each access rather than stored in the database. Videos are played directly from S3, the video data does not pass through the internet server when being played.

# Local Cache Server (Future)

In some locations access to the Internet is unreliable or slow. In these locations we will need to run a local server that maintains a copy of the Project State database and synchronizes this information with the Internet-based server when bandwidth is available. This local server will also need to cache copies of the locally recorded videos as well as videos from reference projects such as ASLV.

It will be possible for a consultant visiting a project to have a local cache server running on their machine and for the data on the consultant machine and the project's cache server to be automatically synchronized. This allows the consultant to bring back the local data in the case where the project internet connection is insufficient to do this.

# Miscelaneous

Information on how to run/debug a local copy of the client on your machine is found in ```client/_README.md```
