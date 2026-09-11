#!/bin/bash

echo "--- Mise à jour de l'application ---"

# Pull latest changes
echo "Récupération des dernières modifications (git pull)..."
git pull

# Install dependencies
echo "Installation des dépendances..."
npm install

# Build
echo "Compilation de l'application..."
npm run build

# Restart (if using PM2 or similar)
if command -v pm2 &> /dev/null; then
    echo "Redémarrage avec PM2..."
    pm2 restart job-tracker || pm2 start dist/server.cjs --name job-tracker
else
    echo "Update terminée. Relancez manuellement le serveur ou le service."
fi

echo "--- Mise à jour terminée ---"
