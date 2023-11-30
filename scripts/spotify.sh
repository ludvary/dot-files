#!/bin/bash

flatpak run --command=sh com.spotify.Client -c 'eval "$(sed s#LD_PRELOAD=#LD_PRELOAD=$HOME/.spotify-adblock/spotify-adblock.so:#g /app/bin/spotify)"'
