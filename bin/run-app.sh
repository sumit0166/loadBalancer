#!/bin/bash

process_name="node"
script_name="app.js"
app_path=".."

SartProcess (){
    if ! command -v "$process_name" &> /dev/null; then
        echo "Node.js is not installed. Please install Node.js before running the process."
        exit 1
    fi

    # Check Node.js version
    # required_version="21.5.0"  # Replace with your required version
    # current_version="$("$process_name" --version | cut -c 2-)"

    # if [[ "$current_version" != "$required_version" ]]; then
    #     echo "Node.js version $required_version is required. Current version is $current_version."
    #     echo "Exiting process.."
    #     exit 1
    # fi

    # Check if the required npm packages are installed

    
    

    required_packages=$(jq -r '.dependencies | keys | join(" ")' "$app_path/package.json")
    for package in $required_packages; do
        echo "Checking package... $package"
        if ! "$process_name" -e "require('$package')" &> /dev/null; then
            echo "Package $package is not installed. Please install the required packages before running the process."
            exit 1
        fi
    done

    cd "$app_path" || exit 1
    "$process_name" "$script_name" 
    # nohup "$process_name" "$script_name" > /dev/null 2>&1 &
    # "$process_name" "$script_name"
    echo "Process $script_name started."
}


if pgrep -f "$process_name $script_name" > /dev/null; then
    echo "Process $script_name is already running."
    echo "Killing the process..."
    pkill -f "$process_name $script_name"
    echo "Process $script_name killed."
    echo "Starting the new process..."
    SartProcess
else
    echo "Process $script_name not found. Starting the process..."
    SartProcess
fi
