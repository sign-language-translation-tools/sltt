# Install nginx

    sudo apt-get update
    sudo apt-get install nginx
    --copy /etc/nginx/sites-available/sltt_server
    ln -s /etc/nginx/sites-available/sltt_server /etc/nginx/sites-enabled/sltt_server
    --copy /etc/nginx/ssl/private.key, bundle.crt
    service nginx restart


# Deploy or Update website

    (on development machine)

    ~/bin/_sltt_

        set -x
        cd ~/_sltt/client
        yarn build
        scp -r build sl:.
        ssh sl "sudo service nginx restart"

# Deploy server

## Install nvm

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.1/install.sh | bash
    source ~/.bashrc
    nvm install 8


## Keep node running

    killall -touch 9 node
    npm install -g pm2
    pm2 start index.js --name SLServer
    pm2 startup  # print cmd you must run to enable pm2 on reboot
    pm2 save

## Install sltt_server

    cd /home/nmiles
    mkdir sltt_server
    cd sltt_server
    git init
    git remote add origin https://github.com/Nathan22Miles/sltt_server.git
    git pull origin master
    --- copy server.json
    mkdir /home/nmiles/videos
    mkdir projects
    pm2 start server.json

## Gather updated server files

    (on dev machine)

    ~/bin/_gather
        ssh sl "cd setup_sltt_server; sudo ./gather"; scp sl:setup_sltt_server.tar ~/setup_sltt_server.tar


# CHEATSHEET

## nginx

    service nginx restart
    /var/log/nginx
    /etc/nginx/sites-available, sites-enabled
    /etc/nginx/ssl
