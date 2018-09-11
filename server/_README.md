<ctl>B   Begin debugging server code

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

    docker build -t nmiles/sltt_server .
    docker run -p 3001:3001 nmiles/sltt_server

Docker to-dos
    !!!add environment variables for S3 access
    !!map disk for db persistence

    add https
    base off smaller image (see progress server)
    connect to central logger
    
# Access Fauton

    http://127.0.0.1:5984/_utils/

    https://github.com/pouchdb/pouchdb-server

    http://localhost:5984/db

# pouchdb-sert

    pouchdb-server --port 3001

    http://127.0.0.1:5984/_utils
    http://127.0.0.1:5984/_all_dbs

