sudo systemctl stop NetworkManager\nsudo rmmod -f rtw89_8852b rtw89_8852b_common rtw89_core\nsudo modprobe rtw89_8852be\nsudo systemctl start NetworkManager
iw dev
sudo iw dev wlp1s0 scan
nmcli connection show
nmcli connection delete Test\ Hotspot
nmcli connection delete UbuntuCore\ Hotspot
sudo systemctl restart NetworkManager
iw dev wlp1s0 info
sudo iw dev wlp1s0 scan
