#!/usr/bin/env bash

# Notify user we're scanning
# notify-send "Wi-Fi" "Scanning for networks..."

# Use timeout to avoid indefinite hangs
wifi_raw=$(timeout 10s nmcli --fields "SECURITY,SSID" device wifi list)

# If scan fails or times out, abort
if [[ -z "$wifi_raw" ]]; then
    notify-send "Wi-Fi" "Scan failed or no networks found."
    exit 1
fi

# Format output
wifi_list=$(echo "$wifi_raw" | sed 1d | sed 's/  */ /g' | sed -E "s/WPA*.?\S/ /g" | sed "s/^--/ /g" | sed "s/  //g" | sed "/--/d")

# Toggle line
wifi_status=$(nmcli -fields WIFI g)
if [[ "$wifi_status" =~ "enabled" ]]; then
	toggle="󰖪  Disable Wi-Fi"
else
	toggle="󰖩  Enable Wi-Fi"
fi

# Present menu via rofi
chosen_network=$(echo -e "$toggle\n$wifi_list" | uniq -u | rofi -dmenu -i -selected-row 1 -p "Wi-Fi SSID: " )
read -r chosen_id <<< "${chosen_network:3}"

# If nothing selected
[[ -z "$chosen_network" ]] && exit

# Handle toggle
if [[ "$chosen_network" == "󰖩  Enable Wi-Fi" ]]; then
	nmcli radio wifi on
	exit
elif [[ "$chosen_network" == "󰖪  Disable Wi-Fi" ]]; then
	nmcli radio wifi off
	exit
fi

# Handle connection
success_msg="You are now connected to \"$chosen_id\"."
if nmcli -g NAME connection | grep -Fxq "$chosen_id"; then
	nmcli connection up id "$chosen_id" | grep -q "successfully" && notify-send "Connected" "$success_msg"
else
	if [[ "$chosen_network" =~ "" ]]; then
		wifi_password=$(rofi -dmenu -p "Password: " )
	fi
	nmcli device wifi connect "$chosen_id" password "$wifi_password" | grep -q "successfully" && notify-send "Connected" "$success_msg"
fi
