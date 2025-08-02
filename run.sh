#!/bin/bash

echo "Starting Charge Buddy 2..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        read -p "Press Enter to exit"
        exit 1
    fi
    echo "Dependencies installed successfully!"
else
    echo "Dependencies already installed."
fi

echo ""
echo "Starting development server..."
npm run dev

read -p "Press Enter to exit" 