#!/bin/sh
echo "Pulling changes..."
cd /root/panorama/live || exit
unset GIT_DIR
git reset --hard
git pull bare master

echo "Installing npm packages..."
npm install

echo "Compiling..."
npm run clean
npm run build-client-prod
npm run build-server

echo "Restarting Panorama services..."
systemctl restart panorama

echo "Done!"