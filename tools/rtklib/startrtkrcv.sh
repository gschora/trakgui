#!/bin/sh

echo "starting rtkrcv..."

/usr/bin/screen -S rtkrcv -d -m /home/hannes/projects/2014/myGitProjects/trakgui/tools/rtklib/rtkrcv -s -p 20200 -m 20300 -o pflanzen2014.conf

exit 0
