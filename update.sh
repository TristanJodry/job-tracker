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

# Restart service (PM2 or systemd or manual)
if command -v pm2 &> /dev/null && pm2 list | grep -q "job-tracker"; then
    echo "Redémarrage avec PM2..."
    pm2 restart job-tracker
elif systemctl is-active --quiet job-tracker 2>/dev/null; then
    echo "Redémarrage du service systemd job-tracker..."
    systemctl restart job-tracker
    echo "Service job-tracker redémarré avec succès !"
else
    echo "Mise à jour terminée. Relancez le serveur ou le service manuellement si besoin."
fi

echo "--- Mise à jour terminée ---"
