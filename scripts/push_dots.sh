#!bin/bash

# this is a bash script to get my nvim theme names, .zshrc and then push them to a private repo

# the dream is to have this check the system time and then once in a week do the above

# copy .zshrc
cp ~/.zshrc /media/HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

# get .config
# rsync -avz  --include i3 --include kitty --include nvim --include picom --include polybar --include rofi --include zathura --exclude .git --exclude .github ~/.config/ /media/HOME/hause/significant\ things/dot_files/.config

rsync -avz  --include i3 --include kitty --include nvim --include picom --include polybar --include rofi --include zathura --exclude'*' ~/.config/ /media/HOME/hause/significant\ things/dot_files/.config

echo ==================================
echo

# get scripts
rsync -avz ~/scripts /media/HOME/hause/significant\ things/dot_files

echo ==================================
echo

# copy yourself
cp ~/scripts/push_dots.sh /media/HOME/hause/significant\ things/dot_files/ && echo push_dots.sh was copied successfully!

echo ==================================
echo

# go to dir
cd /media/HOME/hause/significant\ things/dot_files/

# do git stuff
git add . && git commit -m"added stuff" && git push
