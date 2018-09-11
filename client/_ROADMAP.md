why initial error on login
make login last for 7 days
are we still getting timeouts?

remove unnecessary console.log
log client to online service
log server to online service


gather updated nginx config file
can we start a local db syncing with remote? 
    https://pouchdb.com/2014/06/17/12-pro-tips-for-better-code-with-pouchdb.html
    PouchDB.replicate('mydb', 'http://localhost:5984/mydb', {live: true});
    express-pouchdb -m
    http://localhost:5984/_utils
        Will this modify the remote db???

why does Junior's video have infinite duration?

show deleted videos as greyed in status dropdown???

persist project, portion, passage, playbackRate
don't keep requiring re-login
keyboard control of playback?
allow download passage ???

allow delete of passage version ???
make delete passage be 'drag to garbage can' ???

try cypress.io for integration testing

https://www.chromestatus.com/features/5618491470118912

run unit tests
gather server files
	include home/nmiles/bin

delete passage does not delete all matching db items
remove rename portion command???


prettify ifc
    portion selector ugly (button + mega menu?)
    too much variation in font size in passage selector
    main selector buttons on top right too high

provide way to start server in debug trace mode
    add debug trace, by user? by function?
remember active project, portion, passage
give reasonable error when no server available
add support for root admin

*** Version 0.1 complete

Reference Projects
    specify reference for passage
    
Marble spike

    Marble
        pictures thumbnails resource
        import ESV, RVR, Segond?
        user selection for Marble texts
        display text
        import pictures
        record/play renderings
        follow references

Glossing spike   

    Glosses
        import from ELAN
        * insertion
        play video highlight matching gloss
        voice dictation
    
Helps
        list topics
        create sample topic slide show
        allow SL localization

    server validation of uploaded data
    bug reporting
    exception catching

Maybes

    compare to video drafts section by section
    patch draft videos
    upload to dbl
    validate user based on Paratext Registry
