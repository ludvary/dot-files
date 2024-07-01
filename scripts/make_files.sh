#!/bin/bash

# Check if the user provided the original file name and the number of iterations as arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 original_file num_iterations"
    exit 1
fi

# The original file provided as an argument
original_file="$1"
# The number of iterations provided as an argument
num_iterations="$2"

# Loop to create and modify the specified number of files
for ((i=1; i<=$((num_iterations)); i++)); do
    # Create the new file name
    new_file="${original_file%.*}_$i.${original_file##*.}"
    
    # Copy the original file to the new file
    cp "$original_file" "$new_file"
    
    # Modify the specified line in the new file
    sed -i "s|\([a-zA-Z0-9_]*\)_1.dat|\1_${i}.dat|g" "$new_file"
done
