#!/bin/bash

# Launch Zathura with the provided file in the background
zathura "$@" &

# Allow time for the window to spawn
sleep 0.5

# Collect and save all open PDFs from Zathura instances
> ~/.zathura-session.tmp
for pid in $(pgrep zathura); do
    # Extract command line arguments correctly (handles spaces)
    tr '\0' '\n' < "/proc/$pid/cmdline" | while IFS= read -r arg; do
        if [[ "$arg" == *.pdf && -f "$arg" ]]; then
            realpath -- "$arg" >> ~/.zathura-session.tmp
        fi
    done
done

# Deduplicate and update the session file
sort -u ~/.zathura-session.tmp > ~/.zathura-session
rm ~/.zathura-session.tmp
