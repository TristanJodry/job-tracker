#!/bin/bash

echo "--- Configuration du dépôt Git ---"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initialisation du dépôt Git..."
    git init
fi

# Ask for the remote URL
read -p "Entrez l'URL de votre dépôt Git (ex: https://github.com/user/repo.git): " repo_url

if [ -z "$repo_url" ]; then
    echo "Erreur : L'URL du dépôt est requise."
    exit 1
fi

# Add remote
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"

# Fetch and setup branch
echo "Récupération des données..."
git fetch origin

read -p "Nom de la branche principale (ex: main): " branch
branch=${branch:-main}

echo "Configuration terminée. Vous pouvez maintenant faire 'git pull origin $branch'."
