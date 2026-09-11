#!/bin/bash

echo "--- Job Tracker Setup ---"

# Check dependencies
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the project root."
    exit 1
fi

# Port selection
read -p "Choisissez le port (par défaut 3000): " port
port=${port:-3000}

# Admin password
echo "Configuration du compte Administrateur..."
read -s -p "Nouveau mot de passe admin: " admin_pass
echo ""

# Hash and update admin in db.json
hashed_pass=$(node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('$admin_pass', 10))")

node -e "
const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json'));
const admin = db.users.find(u => u.username === 'admin');
if (admin) {
    admin.password = '$hashed_pass';
} else {
    db.users.push({ id: 'admin-1', username: 'admin', password: '$hashed_pass', role: 'admin' });
}
fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
"

# Create .env
echo "PORT=$port" > .env
echo "GEMINI_API_KEY=" >> .env

echo "--- Configuration terminée ---"
echo "Le port $port a été enregistré dans .env"
echo "Le mot de passe admin a été mis à jour (haché)."
echo ""
echo "Pour lancer l'application en tant que service (systemd), créez un fichier /etc/systemd/system/job-tracker.service avec:"
echo "[Service]"
echo "ExecStart=/usr/bin/npm start"
echo "WorkingDirectory=$(pwd)"
echo "Restart=always"
echo "User=$(whoami)"
echo "Environment=NODE_ENV=production"
