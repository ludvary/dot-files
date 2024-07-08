#!/bin/bash


for file in *.f90; do
    # Extract the base name without the extension
    base_name="${file%.f90}"
    
    ifort -O3 -o "${base_name}.exe" "$file"
done


