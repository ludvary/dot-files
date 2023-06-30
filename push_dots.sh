#!bin/bash

# this is a bash script to get my nvim theme names, .zshrc and then push them to a private repo

# the dream is to have this check the system time and then once in a week do the above

# copy .zshrc
cp ~/.zshrc /media/fomalhaut/HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

echo ==================================
echo

# go to nvim/themes and get the names
cd ~/.config/nvim/themes/ && fd --max-depth 1 > /media/fomalhaut/HOME/hause/significant\ things/dot_files/theme_names.txt && echo nvim themes were copied successfully

echo ==================================
echo

# copy init.lua
cp ~/.config/nvim/init.lua /media/fomalhaut/HOME/hause/significant\ things/dot_files/ && echo init.lua was copied successfully!

echo ==================================
echo

# copy yourself
cp ~/push_dots.sh /media/fomalhaut/HOME/hause/significant\ things/dot_files/ && echo push_dots.sh was copied successfully!

echo ==================================
echo

# go to dir
cd /media/fomalhaut/HOME/hause/significant\ things/dot_files/

# do git stuff
git add . && git commit -m"added stuff" && git push
