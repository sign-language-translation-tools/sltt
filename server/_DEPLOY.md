See SLTT/_DEPLOY.md for instructions on how to do initial setup for both the website and this server.



# CHEATSHEET

# How to create a patch for node_modules

* Make copy module xyz to xyz.org
* Edit xyz
* diff -uNr xyz.org xyz >../patches/patch_xyz
* cd ../patches
* edit apply_patches to include new patch

To apply patch

* cd patches
* ./apply_patches

# Update server app

    push source changes to github

    _sl
        _sl = ~/bin/_sl
        ssh sl

        sl = .ssh/sh
            ServerAliveInterval 120
            Host sl
                HostName sl.paratext.org
                Port 22
                User nmiles
                IdentityFile "~/.ssh/NathanMiles3"

        ~/.ssh/NathanMiles3 =
            ----BEGIN RSA PRIVATE KEY---- ...

    (now you are on server)

    _rst = ~/bin/_rst
        set -x
        cd sltt_server
        pm2 stop server.json
        pm2 flush
        git pull origin master
        pm2 start server.json
        pm2 logs

## View nginx access and error logs

    ~/bin/nginxlog

## pm2

    pm2 ls
    pm2 logs
    pm2 restart server.json
    pm2 start xxx.js  (or server.json)
    pm2 start xxx.js --name "SLServer"  # start running
    pm2 stop _App name_
    pm2 delete _App name_    # remove from list
    pm2 save
    pm2 flush   # clear logs
