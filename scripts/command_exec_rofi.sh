#!/bin/bash

rofi -e "$(zsh -c "$(rofi -dmenu -p 'Run command' -theme-str 'listview {lines: 0;}')" 2>&1 )"

# will have to fix this shit, cuz right now the commands are fine but when user input is requred like passwords it doesnt work.
