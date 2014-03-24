#!/bin/bash
/usr/bin/screen -S mapproxy -d -m ../bin/mapproxy-util serve-develop mymapproxyConfig.yaml -b 0.0.0.0:8080
