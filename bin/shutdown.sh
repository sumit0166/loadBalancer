#!/bin/bash

process_name="node"
script_name="app.js"
pid=$(pgrep -f "$process_name.*$script_name")

if [ -n "$pid" ]; then
    echo "$pid -- Process $script_name is running."
    echo "Killing the process..."
    kill -9 "$pid"
    echo "Process $script_name killed."
else
    echo "Process $script_name is not running."
fi

