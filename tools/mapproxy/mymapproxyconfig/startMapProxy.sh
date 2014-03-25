#!/bin/bash
/usr/bin/screen -S mapproxy -d -m  ./tools/mapproxy/bin/mapproxy-util serve-develop ./tools/mapproxy/mymapproxyconfig/mymapproxyConfig.yaml -b 0.0.0.0:8080
