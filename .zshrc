# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

#ZSH_THEME=random

# ZSH_THEME="agnoster"
# ZSH_THEME="gnzh"
# ZSH_THEME="lambda"
# ZSH_THEME="nicoulaj"
# ZSH_THEME="norm"  # this is suprisiingly good!
#ZSH_THEME="robbyrussell"
# ZSH_THEME="sunrise"
#ZSH_THEME="af-magic" # nice af
#ZSH_THEME="minimal"
#ZSH_THEME="arrow" # nice af but messes up ls

# all of these show times
#ZSH_THEME="tjkirch"
#ZSH_THEME="tonotdo"
# ZSH_THEME="bureau" # nice
#ZSH_THEME="clean" # nice
ZSH_THEME="dieter"
# ZSH_THEME="crunch" # nice


# set neovim as the manpager
# export MANPAGER="nvim -c 'set ft=nam' -"
# set bat as manpager
# export MANPAGER="sh -c 'col -bx | bat -l man -p'"


# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
COMPLETION_WAITING_DOTS="true"

# formating for timestamps in history command
HIST_STAMPS="mm/dd/yyyy"

# Add wisely, as too many plugins slow down shell startup.
plugins=(git
    zsh-syntax-highlighting
    zsh-autosuggestions)

# EDITOR=vim ranger

export EDITOR=vim
export VISUAL=vim

source $ZSH/oh-my-zsh.sh



# ALIASES

# apps
# alias vi="$HOME/.local/bin/lvim"
alias nvim="$HOME/.local/bin/lvim"
# alias nvim=vi
# alias eemec="cd $HOME/hause/significant\ things/ && emacs &"
alias elitist_choice="(sig_things && nvim)"  # use a subshell so that when you exit you return to the dir that you started on 
alias nofetch="nofetch --flex red"
alias neofetch_win="neofetch --ascii_distro windows"
alias hollow_knight="wine ~/.wine/drive_c/Program\ Files\ \(x86\)/DODI-Repacks/Hollow\ Knight/hollow_knight.exe && exit"
# alias minecraft="java -jar ~/Downloads/mine/TLauncher-2.885.jar && exit"
alias minecraft="java -jar ~/SKlauncher-3.2.9.jar && exit"
alias fuzz="(cd / && fzf)"
alias ls="eza --icons"
alias ll="eza --long --no-filesize --no-user --time-style=long-iso --icons"
# alias spotify="$HOME/scripts/spotify.sh"
# alias tor="~/Downloads/tars/tor-browser/Browser/start-tor-browser --detach"
alias rip="rip --graveyard $HOME/graveyard"
alias purge_graveyard="rm -rf $HOME/graveyard/*"

# dirs
alias sig_things="cd $HOME/hause/significant\ things/"
alias Geet="cd $HOME/hause/significant\ things/Git\ Projects"
alias Julia="cd $HOME/hause/significant\ things/code/Julia"
alias Python="cd $HOME/hause/significant\ things/code/mostly_py"
# alias summer="cd $HOME/hause/significant\ things/code/summer_proj_2024"
alias Code="cd $HOME/hause/significant\ things/code"

# qol
alias update="sudo dnf update && sudo dnf upgrade -y && exit"
alias push_dots="bash ~/scripts/push_dots.sh"
alias clean_coredump="fd 'julia' /var/lib/systemd/coredump/ | xargs sudo rm"
alias sus="$HOME/scripts/lock.sh && systemctl suspend"
alias hib="$HOME/scripts/lock.sh && systemctl hibernate"
alias rxfetch="$HOME/scripts/rxfetch/rxfetch"
alias auto_click="$HOME/scripts/auto_click.sh"
alias clean_graveyard="rm -rf $HOME/graveyard/*"
alias ran=". ranger"  # cd into the path that you exit ranger

# alias double_audio="pactl load-module module-combine-sink > /tmp/pactl.txt"

# ssh
alias ssh_lab="ssh admin3@192.168.8.31" # pass ccms@admin
alias ssh_main_lab="ssh admin3@192.168.8.26"
alias cluster_beta="ssh -X krishna@192.168.35.162" # pass : 23rd
# alias my_pc="ssh -X krishna@192.168.33.150"         # pass : 23rd
alias my_pc="ssh -X krishna@ 192.168.35.121"       # pass : 23rd

# to enable some vim goodness in terminal
set -o vi

# # start wal and bring back previous colorscheme
# (cat ~/.cache/wal/sequences &)
# source ~/.cache/wal/colors-tty.sh

# source /opt/intel/oneapi/setvars.sh > /dev/null 2>&1
source $HOME/intel/oneapi/setvars.sh > /dev/null 2>&1

# nerdfetch
# nerdfetch

neofetch --ascii .config/neofetch/ghost.ascii
sudo systemctl restart sshd
sudo cpupower frequency-set -g performance > /dev/null


# store more commands in history
export HISTSIZE=100000
export HISTFILESIZE=100000

# enable tap to touch in xinput. xinput for some reason changes the id of touchpad like everytime, so i have to get it by grep.
touchpad_id=$(xinput list | grep -i "Touchpad" | grep -o "id=[0-9]\+" | grep -o "[0-9]\+")
xinput set-prop "$touchpad_id" "libinput Tapping Enabled" 1

# enable simultaneous audio via pavucontrol
# pactl load-module module-combine-sink > /tmp/pactl.txt

#to add a newline after each propmt
# precmd() {
#     precmd() {
#         echo
#     }
# }

# PATHS
export PATH="$HOME/.config/emacs/bin/:$PATH"
export PATH="$HOME/scripts:$PATH"       # add scripts to the path
export PATH="$HOME/.cargo/bin:$PATH"    # add the cargo binaries to the path
export PATH="$HOME/.juliaup/bin":$PATH  # had to do this manaually idk
export PATH="$HOME/.local/bin":$PATH
export PATH="$HOME/Downloads/misc/fullprof":$PATH
export PATH="$HOME/networkmanager-dmenu":$PATH


export PATH=/usr/lib64/openmpi/bin:$PATH
export LD_LIBRARY_PATH=/usr/lib64/openmpi/lib:$LD_LIBRARY_PATH
export MANPATH=/usr/share/openmpi/man:$MANPATH

# use >= threads than CPUs 
export JULIA_NUM_THREADS=8
export OMP_NUM_THREADS=8


# for mpd, i have no idea what this does
export MPD_HOST=$HOME/.config/mpd/socket



# ### FullProf Suite ###
# FULLPROF=/home/Fornax/Downloads/misc/fullprof
# PATH=$FULLPROF:$PATH
# export PATH FULLPROF
# ######################
# ### FullProf Suite ###
# FULLPROF=/home/Fornax/Downloads/misc/fullprof
# PATH=$FULLPROF:$PATH
# export PATH FULLPROF
# ######################
# ### FullProf Suite ###
FULLPROF=/home/Fornax/Downloads/misc/fullprof
PATH=$FULLPROF:$PATH
export PATH FULLPROF
# source /home/Fornax/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
