# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# ZSH_THEME="agnoster" 
# ZSH_THEME="gnzh"
# ZSH_THEME="lambda"
# ZSH_THEME="nicoulaj"
# ZSH_THEME="norm"  # this is suprisiingly good!
ZSH_THEME="robbyrussell"

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

source $ZSH/oh-my-zsh.sh



# ALIASES

# apps
alias nvim="$HOME/.local/bin/lvim"
alias vim=nvim
alias elitist_choice="sig_things && vim"
alias nofetch="nofetch --flex red"
alias neofetch_win="neofetch --ascii_distro windows"
alias hollow_knight="wine ~/.wine/drive_c/Program\ Files\ \(x86\)/DODI-Repacks/Hollow\ Knight/hollow_knight.exe && exit"
alias minecraft="java -jar ~/Downloads/mine/TLauncher-2.885.jar && exit"
alias fuzz="cd / && fzf"
alias spotify="$HOME/scripts/spotify.sh"
# alias tor="~/Downloads/tars/tor-browser/Browser/start-tor-browser --detach"

# dirs
alias sig_things="cd $HOME/hause/significant\ things/"
alias Geet="cd $HOME/hause/significant\ things/Git\ Projects"
alias Julia="cd $HOME/hause/significant\ things/code/Julia"
alias Python="cd $HOME/hause/significant\ things/code/mostly_py"

# qol
alias update="sudo dnf update && sudo dnf upgrade -y && exit"
alias push_dots="bash ~/scripts/push_dots.sh"
alias clean_coredump="fd 'julia' /var/lib/systemd/coredump/ | xargs sudo rm"
alias sus="$HOME/scripts/lock.sh && systemctl suspend"

# ssh
alias ssh_lab="ssh admin3@192.168.8.31"
alias ssh_lab_tonmoi="ssh admin3@192.168.8.44"
alias ssh_main_lab="ssh admin3@192.168.8.26"


# to enable some vim goodness in terminal
set -o vi

# nerdfetch
# nerdfetch

# neofetch
neofetch


# store more commands in history
export HISTSIZE=100000
export HISTFILESIZE=100000

# enable tap to touch in xinput. xinput for some reason changes the id of touchpad like everytime, so i have to get it by grep.
touchpad_id=$(xinput list | grep -i "Touchpad" | grep -o "id=[0-9]\+" | grep -o "[0-9]\+")
xinput set-prop "$touchpad_id" "libinput Tapping Enabled" 1

#to add a newline after each propmt
# precmd() {
#     precmd() {
#         echo
#     }
# }

# PATHS
export PATH="$HOME/scripts:$PATH"       # add scripts to the path
export PATH="$HOME/.cargo/bin:$PATH"    # add the cargo binaries to the path
export PATH="$HOME/.juliaup/bin":$PATH  # had to do this manaually idk
export PATH="$HOME/.local/bin":$PATH    

# for julia to use all threads while multi-threading
export JULIA_NUM_THREADS=16

# >>> juliaup initialize >>>

# !! Contents within this block are managed by juliaup !!

path=('$HOME/.juliaup/bin' $path)  # idk but writing this doesnt work hence i exported the path manaually above.
export PATH

# <<< juliaup initialize <<<

