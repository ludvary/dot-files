#!bin/bash

# copy .zshrc
cp ~/.zshrc $HOME/hause/significant\ things/dot_files/ && echo .zshrc was copied successfully!

# get .config
rsync -avz --exclude-from=$HOME/scripts/exclude_from_config.txt ~/.config $HOME/hause/significant\ things/dot_files && echo .config was copied successfully!

echo ==================================
echo

# get scripts
rsync -avz ~/scripts $HOME/hause/significant\ things/dot_files && echo scripts were coped successfully!

echo ==================================
echo

# copy zsh custom robbyrussel theme
cp ~/.oh-my-zsh/themes/robbyrussell.zsh-theme $HOME/hause/significant\ things/dot_files && echo robbyrussell zsh theme copied successfully!!

cp ~/.oh-my-zsh/themes/dieter.zsh-theme $HOME/hause/significant\ things/dot_files && echo dieter zsh theme copied successfully!!

echo ==================================
echo

# copy yourself
cp ~/scripts/push_dots.sh $HOME/hause/significant\ things/dot_files/ && echo push_dots.sh was copied successfully!

echo ==================================
echo

# rm -rf Prospect mail
cd $HOME/hause/significant\ things/dot_files/.config/ && rm -rf Prospect\ Mail

# go to dir
cd $HOME/hause/significant\ things/dot_files/

# do git stuff
git add . && git commit -m"add stuff" && git push
