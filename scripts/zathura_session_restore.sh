#!/bin/bash

while IFS= read -r file; do
    if [[ -f "$file" ]]; then
        zathura "$file" &
    fi
done < ~/.zathura-session
