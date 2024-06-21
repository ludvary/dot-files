#!/bin/bash
# Get all process IDs that match the window class of "Minecraft"
pids=$(xdotool search --class "Minecraft")

# Loop them to find the valid window
for pid in $pids; do
  name=$(xdotool getwindowname $pid)

  if [[ $name == *"Minecraft"* ]]; then
    # Convert decimal PID to hexadecimal
    window_id=$(printf 0x"%x\n" $pid)

    # Start clicking every second
    while true; do
      # Perform a left-click
      xdotool mousedown --window $window_id 1
      xdotool mouseup --window $window_id 1
      # Wait for 1 second
      sleep 1
    done

    # Stop looping
    break
  fi
done
