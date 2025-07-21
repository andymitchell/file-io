#!/usr/bin/env bash

echo "Raise an error y/n"
read answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "An error occurred"
    exit 1
else 
    echo "All OK"
fi

echo "Done"