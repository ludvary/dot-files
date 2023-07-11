#! /bin/bash

date_time=$(date)
date_time="${date_time// /}"

# take the screenshot of the selection
scrot -s ~/scrot/$date_time.png

# save the selection to clipboard
xclip -selection clipboard -t image/png -i ~/scrot/"$date_time.png"
