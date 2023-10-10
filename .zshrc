# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

#ZSH_THEME="agnoster"
# ZSH_THEME="gnzh"
# ZSH_THEME="lambda"
# ZSH_THEME="nicoulaj"
#ZSH_THEME="norm"  # this is suprisiingly good!
ZSH_THEME="robbyrussell"

# set neovim as the manpager
# export MANPAGER="nvim -c 'set ft=nam' -"

# set bat as manpager
# export MANPAGER="sh -c 'col -bx | bat -l man -p'"


# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git
    zsh-syntax-highlighting
zsh-autosuggestions)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

alias minecraft="java -jar ~/Downloads/mine/TLauncher-2.885.jar && exit"
alias nvim="/home/ludvary-Fomalhaut/.local/bin/lvim"
alias vim=nvim
alias sig_things="cd /media/HOME/hause/significant\ things/"
alias Geet="cd /media/HOME/hause/significant\ things/Git\ Projects"
alias Julia="cd /media/HOME/hause/significant\ things/code/Julia"
alias Python="cd /media/HOME/hause/significant\ things/code/mostly_py"
#alias elitist_choice="sig_things && vim"
alias elitist_choice="sig_things && /home/ludvary-Fomalhaut/.local/bin/lvim"
#alias update="sudo apt update && sudo apt upgrade -y && exit"
alias update="sudo dnf update && sudo dnf upgrade -y && exit"
alias hollow_knight="wine ~/.wine/drive_c/Program\ Files\ \(x86\)/DODI-Repacks/Hollow\ Knight/hollow_knight.exe && exit"
alias push_dots="bash ~/scripts/push_dots.sh"
alias nofetch="nofetch --flex red"
alias fuzz="cd / && fzf"
alias clean_coredump="fd 'julia' /var/lib/systemd/coredump/ | xargs sudo rm"
alias neofetch_win="neofetch --ascii_distro windows"
alias sus="$HOME/scripts/lock.sh && systemctl suspend"

alias ssh_lab="ssh admin3@192.168.8.22"
alias ssh_lab_tonmoi="ssh admin3@192.168.8.44"
alias ssh_main_lab="ssh admin3@192.168.8.26"
# alias tor="~/Downloads/tars/tor-browser/Browser/start-tor-browser --detach"


# to enable some vim goodness in terminal
set -o vi

# nerdfetch
nerdfetch

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
export PATH="$HOME/scripts:$PATH" # add scripts to the path
export PATH="$HOME/.cargo/bin:$PATH" # add the cargo binaries to the path

# for julia to use all 4 threads while multi-threading
export JULIA_NUM_THREADS=4


# >>> juliaup initialize >>>

# !! Contents within this block are managed by juliaup !!

path=('/home/ludvary-Fomalhaut/.juliaup/bin' $path)
export PATH

# <<< juliaup initialize <<<

