# System Overview

The SLTT system consists of a client running in a browser and a backend server running on a Linux machine. Only the chrome browser is currently supported. Windows and OSx are supported.

Possible futures: Support other browsers. Support a standalone version of the client using Electron or a similar package.

![Diagram](http://sign-language-translation-tools.github.io/sltt/overview.png)

# Client

The client consists of a React UI displaying information found in two state models.

## Project State

This is persistent information about a specific translation project. This includes the following

* Metadata such as the list of portions and passages within portions to be recorded
* Video passage draft recordings for each passage and the review status of each recording
* Video or written notes concerning recorded drafts of passages passages
* List of members and their roles in the project

This is stored as a tree of [mobx-state-tree](https://github.com/mobxjs/mobx-state-tree) objects. Any React compnent wrapped in the mobx-react class will be reactively re-rendered whenever any data which the component uses from the Project State object changes.

Initially this information is read from the project PouchDB database on the server. Any changes made to this data by this client or any other client accessing this project on the server are automatically sent to the client causing the project state model to be updated and triggering a re-rendering of the information in the React components.

## Video State

This is NONpersistent information concerning what video passage draft has currently been selected and what the state of the video display is e.g. playing, recording, stopped, etc. I will

This is stored as a [MobX](https://github.com/mobxjs/mobx) object. Any React wrapped in the mobx-react class will be reactively re-rendered whenever any data which the component uses from the video State object changes.

## Google OpenId Authentication

Users may log into the client using their Gmail identity based on the support described at developers.google.com/identity/sign-in/web/reference. Top this login returns a JWT containing their identity information. This JWT is passed to the server to validate each request.

## DBS Octopus Authentication

Users on DBS related projects may log in to the client using their DBS Octopus system of login credentials. This will result in a JWT which will be used to validate each request to the server. This has not been implemented yet.

# Server

## Nginx Reverse Proxy

The reverse proxy performs the following functions

* Examines the requesting URL to determine the desired server, i.e. sltt.paratext.org versus sltt-dev.paratext.org. Currently only sltt.paratext.org running.
* Translates https requests to http requests and forwards them to the internal server

## Express.js

Express.js is used to process the incoming HTTP requests from the client.

## Authentication

**authentication.js**: The JWT is extracted from the authorization header and cryptographically validated. The e-mail address field for the user is extracted and attached to the req structure. Requests with invalid or absent JWTs are rejected.

## Authorization

**getMembers.js**: Retrieve a list of valid members for the project named in the request from the PouchDB database. This information includes the project role for each user.

Roles: 

* observer - Can view videos and notes but cannot create them.
* consultant - Can view videos but not create them. Can view and create notes.
* translator - Can view and create videos. Can view and create notes.
* admin - Can view and create videos. Can view and create notes. Can add and remove members from project and change their roles.


**authorization.js**: The user's role in the project is determined based on their e-mail address. Requests from non-project e-mail addresses are rejected. If the user does not have an admin role in the project and the request seeks to modify the members of the project or the roles, the request is rejected.

## projects

**projects.js**: Return a list of project names which the current user is a member of.

## PouchDB

[PouchDB](https://pouchdb.com/) is an open-source JavaScript database inspired by Apache CouchDB that is designed to run well within the browser. Currently only an adapter runs in the browser and attaches it to the database running in the server. Changes made on one client are pushed to all connected clients in real-time.

PouchDB was created to help web developers build applications that work as well offline as they do online.

PouchDB is used to store all the information from the Project State structure. There is one PouchDB database per project.

## push

**pushBlob.js**: The HTML 5 videos support produces a series of small binary blobs when recording. Each blob is sent separately to the server. Sending them as they are produced minimizes the amount of time between the video recording finishing and the full video been uploaded to the server. These blobs are stored in temporary files on the server. 
## concat

**concatBlob.js**: After all blobs in the video have been uploaded they are concatenated together into a single blob containing the entire video and this blob is uploaded directly from the server to Amazon S3. After the data has been pushed to Amazon S3 the temporary files are deleted.

## url

**getUrl.js**: in order for the client to play an existing video passage a signed URL for this video must be generated by the Amazon S3 system. The signed URLs have a limited lifespan so they are generated on each access rather than stored in the database. Videos are played directly from S3, the video data does not pass through the server when being played.

# Local Cache Server (Future)

In some locations access to the Internet is unreliable or slow. In these locations we will need to run a local server that maintains a copy of the Project State database and synchronizes this information with the Internet-based server when bandwidth is available. This local server will also need to cache copies of the locally recorded videos as well as videos from reference projects such as ASLV.

It should be possible for a consultant visiting a project to have a local cache server running on their machine and for the data on the consultant machine and the project's cache server to be automatically synchronized. This allows the consultant to bring back the local data in the case where their Internet connection is insufficient to do this.
