#! /bin/bash

date_time=$(date)
date_time=${date_time// /}
# take the screenshot
scrot  ~/scrot/"$date_time.png"

# save it to clipboard
xclip -selection clipboard -t image/png -i ~/scrot/"$date_time.png"
