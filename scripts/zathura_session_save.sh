#!/bin/bash

> ~/.zathura-session.tmp

# Collect all Zathura PIDs and their opened PDFs
for pid in $(pgrep zathura); do
    # Handle each argument properly, accounting for spaces
    tr '\0' '\n' < "/proc/$pid/cmdline" | while IFS= read -r arg; do
        if [[ "$arg" == *.pdf && -f "$arg" ]]; then
            realpath -- "$arg" >> ~/.zathura-session.tmp
        fi
    done
done

# Deduplicate entries and update the session file
sort -u ~/.zathura-session.tmp > ~/.zathura-session
rm ~/.zathura-session.tmp
