#!/bin/sh

./tools/mapproxy/mymapproxyconfig/startMapProxy.sh
./js/util/startcontroler.sh
./tools/rtklib/startrtkrcv.sh
/bin/sleep 5

./nw
