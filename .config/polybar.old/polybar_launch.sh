#! /bin/sh

# terminate already running instances
killall -q polybar

# wait until the processess have been shut down
while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done

# launch bar
polybar center_bar -c ~/.config/polybar/config.ini &
polybar left_bar -c ~/.config/polybar/config.ini &
polybar right_bar -c ~/.config/polybar/config.ini &

