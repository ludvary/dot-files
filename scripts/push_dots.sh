#!bin/bash

# copy .zshrc
cp ~/.zshrc /media/HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

# get .config
rsync -avz --exclude-from=$HOME/scripts/exclude_from_config.txt ~/.config /media/HOME/hause/significant\ things/dot_files && echo .config was copied successfully!

echo ==================================
echo

# get scripts
rsync -avz ~/scripts /media/HOME/hause/significant\ things/dot_files && echo scripts were coped successfully!

echo ==================================
echo

# copy zsh custom robbyrussel theme
cp ~/.oh-my-zsh/themes/robbyrussell.zsh-theme /media/HOME/hause/significant\ things/dot_files && echo zsh theme copied successfully!!

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
