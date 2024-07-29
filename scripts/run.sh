#!/bin/bash

sudo timedatectl set-timezone Asia/Kolkata

sudo dnf copr enable atim/bottom -y
sudo dnf copr enable jerrycasiano/FontManager

sudo dnf install --allowerasing ranger nitrogen xinput zsh git pip npm cargo rofi xclip sqlite i3lock liberation-fonts python3-pip lxappearance xinput gpick snapd python3-devel gcc zathura fish java-latest-openjdk.x86_64 bat gwenview neovim texlive-latex okular latexmk texlive-multirow flameshot xkill wine gparted scrot fzf texlive-makecell texlive-minted zoxide eza go texlive-wrapfig gvfs-mtp xdotool lapack lapack-devel gcc-gfortran kernel-tools && cargo install toipe rm-improved && go install -v github.com/alpkeskin/mosint/v3/cmd/mosint@latest && pip install pywal && pip install --user colorz

mkdir $HOME/graveyard

#git clone git@github.com:ludvary/dot-files.git

sudo dnf install https://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$\(rpm -E %fedora).noarch.rpm

sudo dnf copr enable trixieua/jp2a
