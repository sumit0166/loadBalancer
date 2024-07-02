#!/bin/bash

process_name="node"
script_name="backendServer.js"

if pgrep -f "$process_name $script_name" > /dev/null; then
    echo "Process $script_name is running."
    echo "Killing the process..."
    pkill -f "$process_name $script_name"
    echo "Process $script_name killed."
else
    echo "Process $script_name is not running."
fi
