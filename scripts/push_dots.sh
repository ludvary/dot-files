#!bin/bash

# this is a bash script to get my nvim theme names, .zshrc and then push them to a private repo

# the dream is to have this check the system time and then once in a week do the above

# copy .zshrc
cp ~/.zshrc /media/HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

# get .config
rsync -avz --exclude-from=./exclude_from_config.txt ~/.config /media/HOME/hause/significant\ things/dot_files

echo ==================================
echo

# copy the .config exclude list
cp ~/scripts/exclude_from_config.txt /media/HOME/hause/significant\ things/dot_files && echo exclude list was copied successfully!

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
