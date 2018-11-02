# Environment Variables

SLTT_PROJECTS_DIR = Directory to containing PouchDB databases for projects
SLTT_VIDEOS_DIR = directory containing temporary video blobs prior to upload to S3

SLTT_USER_JWT = jwt for unittest user
SLTT_USER = email address for unittest user

SLTT_UPLOADER_ACCESS_KEY = access key for S3 bucket containing uploaded videos
SLTT_UPLOADER_SECRET_ACCESS_KEY = secret access key for S3 bucket containing uploaded videos
SLTT_BUCKET = S3 bucket name

On the development machine these values are kept in the sltt_environment file
of the developers home directory.

TODO Investigate using git-crypt to keep these encoded but with the respository

# Init new project

node initProject.js ASLVtest 
    add -r at end to delete!!! all existing project data

# Express Internals

    [ServerRespone](nodejs.org/api/http.html#http_class_http_serverresponse)
        * EventEmitter 
          ** close (connection terminated before .end() was called)
        * end([date],[encoding],[callback])
        * statusCode, statusMessage
    [ClientRequest]
        * method
        * originalUrl

# Docker

TODO Decide if we should run sltt as a docker image.

Pros
* Could run same image on development machine and server
* Might make it easier to separate development, qa, and productions servers
* Keeping images would provide a quick way to roll back painful changes

Cons
* More complicated than using PM2? One more technology to juggle

    docker build -t nmiles/sltt_server .
    docker run -p 3001:3001 nmiles/sltt_server

# Access Fauton

TODO Figure out if we could use this as a debugging aid

    http://127.0.0.1:5984/_utils/

    https://github.com/pouchdb/pouchdb-server

    http://localhost:5984/db

