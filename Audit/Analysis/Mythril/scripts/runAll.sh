#!/bin/bash

error_count=0
error_log="error.log"
summary=""
commands_file="runs"

# Error handling function
handle_error() {
    error_count=$((error_count + 1))
    error_message="Error in command '$1': $(cat $error_log)"
    summary+="Error $error_count: $error_message"$'\n'
}

# Clear the error log file
echo "" > "$error_log"

# Check if commands file exists
if [ ! -f "$commands_file" ]; then
    echo "Commands file not found: $commands_file"
    exit 1
fi

# Loop through the commands from the file
while IFS= read -r cmd; do
    # Trap errors and call handle_error
    trap 'handle_error "$cmd"; continue;' ERR

    # Print the command to the screen
    echo "Executing: $cmd"
    
    # Execute the command
    eval "${cmd}" > /tmp/cmd_output.txt 2> "$error_log"
    cat /tmp/cmd_output.txt >> /tmp/mythril.json
done < "$commands_file"

# Print the summary of errors
if [ $error_count -gt 0 ]; then
    echo -e "\nSummary of errors:"
    echo -e "$summary"
else
    echo "All commands executed successfully."
fi

