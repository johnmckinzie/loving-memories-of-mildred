#!/bin/bash
set -e

# Only build if cook is not already installed
if ! command -v cook &> /dev/null
then
    echo "CookCLI not found. Building from source..."
    git clone https://github.com/cooklang/cookcli.git /tmp/cookcli
    cd /tmp/cookcli
    npm install
    npm run build-css
    cargo install --path .
    rm -rf /tmp/cookcli
    echo "Installation finished!"
else
    echo "CookCLI is already installed."
fi