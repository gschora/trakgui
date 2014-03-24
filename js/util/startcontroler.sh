#!/bin/sh

echo "starting controler..."

/usr/bin/screen -S controler -d -m /home/hannes/.nvm/v0.10.26/bin/node /home/hannes/projects/2014/myGitProjects/trakgui/js/util/controler.js

exit 0