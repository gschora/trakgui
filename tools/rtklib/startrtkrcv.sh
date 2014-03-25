#!/bin/sh

echo "starting rtkrcv..."

/usr/bin/screen -S rtkrcv -d -m ./tools/rtklib/rtkrcv -s -p 52002 -m 52001 -o ./tools/rtklib/pflanzen2014.conf

exit 0
