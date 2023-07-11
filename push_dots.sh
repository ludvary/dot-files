#!bin/bash

# this is a bash script to get my nvim theme names, .zshrc and then push them to a private repo

# the dream is to have this check the system time and then once in a week do the above

# copy .zshrc
cp ~/.zshrc /media/HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

# get i3 config
rsync -av ~/.config/ /media/HOME/hause/significant\ things/dot_files

echo ==================================
echo

# get scripts
rsync -av ~/scripts/ /media/HOME/hause/significant\ things/dot_files

echo ==================================
echo

# copy yourself
cp ~/push_dots.sh /media/HOME/hause/significant\ things/dot_files/ && echo push_dots.sh was copied successfully!

echo ==================================
echo

# go to dir
cd /media/HOME/hause/significant\ things/dot_files/

# do git stuff
git add . && git commit -m"added stuff" && git push
