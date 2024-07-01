#!/bin/bash

# Loop over all .f90 files in the current directory
for file in *.f90; do
    # Extract the base name without the extension
    base_name="${file%.f90}"
    
    # Compile the file with gfortran
    gfortran -fPIC -O3 -march=native -ffast-math -funroll-loops -o "${base_name}.exe" "$file"
    
    # # Check if the compilation was successful
    # if [ $? -eq 0 ]; then
    #     echo "Successfully compiled $file to ${base_name}.exe"
    # else
    #     echo "Failed to compile $file"
    # fi
done
