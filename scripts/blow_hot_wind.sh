#!/bin/bash

## ======================================================================= ##
#   make /etc/systemd/system/blow_hot_wind.service that looks like this

   
    #  [Unit]
    # Description=Fan Control Service

    # [Service]
    # ExecStart=/home/Fornax/scripts/blow_hot_wind.sh
    # Restart=always
    # User=Fornax
    # WorkingDirectory=/home/Fornax/scripts

    # [Install]
    # WantedBy=multi-user.target   
    



    # reload the daemon by sudo systemctl daemon-realod
    # start the service by systemctl start blow_hot_wind.service
    # enable the service to start on boot by sudo systemctl enable fan_control.service
    # also add the line to sudoers file 
    # Fornax ALL=(ALL) NOPASSWD: /usr/bin/tee /sys/devices/platform/asus-nb-wmi/hwmon/hwmon6/pwm1_enable
#
#
# then to stop selinux from messing up the service do this
# sudo setenforce 0
# sudo ausearch -m avc -ts recent | sudo audit2allow -M my_fan_control
# sudo semodule -i my_fan_control.pp
# sudo semodule -i my_fan_control.pp
## ======================================================================= ##


# Path to the temperature and fan control files
TEMP_FILE="/sys/devices/virtual/thermal/thermal_zone0/temp"
FAN_SPEED_FILE="/sys/devices/platform/asus-nb-wmi/hwmon/hwmon6/fan1_input"
FAN_CONTROL_FILE="/sys/devices/platform/asus-nb-wmi/hwmon/hwmon6/pwm1_enable"

# Function to read temperature
get_temp() {
  # Temperature is in millidegrees Celsius, so divide by 1000 to get degrees Celsius
  cat "$TEMP_FILE" | awk '{print $1/1000}'
}

# Function to set fan mode
set_fan_mode() {
  local mode=$1
  echo $mode | sudo tee "$FAN_CONTROL_FILE" > /dev/null
}

# Initial fan mode (-1 indicates no mode has been set yet)
current_mode=-1

# Main loop
while true; do
  temp=$(get_temp)
  echo "Current temperature: $temp°C"

  if (( $(echo "$temp > 75" | bc -l) )); then
    if [[ $current_mode -ne 0 ]]; then
      echo "Temperature exceeds 55°C, setting fan to max speed"
      set_fan_mode 0
      current_mode=0
    fi
  else
    if [[ $current_mode -ne 2 ]]; then
      echo "Temperature below 55°C, setting fan to power-saving mode"
      set_fan_mode 2
      current_mode=2
    fi
  fi

  sleep 2
done
