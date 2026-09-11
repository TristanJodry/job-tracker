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

# Systemd Service Prompt
read -p "Voulez-vous générer un fichier de service systemd pour lancer l'app au démarrage ? (y/n): " gen_service

if [[ "$gen_service" =~ ^[Yy]$ ]]; then
    SERVICE_FILE="job-tracker.service"
    USER_NAME=$(whoami)
    WORKING_DIR=$(pwd)
    
    cat > $SERVICE_FILE <<EOF
[Unit]
Description=Job Tracker Pro Application
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$WORKING_DIR
ExecStart=/usr/bin/npm start
Restart=always
Environment=NODE_ENV=production
Environment=PORT=$port

[Install]
WantedBy=multi-user.target
EOF

    echo "Fichier '$SERVICE_FILE' généré avec succès."
    
    read -p "Voulez-vous tenter d'installer et lancer le service maintenant ? (nécessite sudo) (y/n): " run_sudo
    
    if [[ "$run_sudo" =~ ^[Yy]$ ]]; then
        echo "Exécution des commandes sudo..."
        sudo cp $WORKING_DIR/$SERVICE_FILE /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable job-tracker
        sudo systemctl start job-tracker
        echo "Service installé et démarré !"
    else
        echo "Installation manuelle requise :"
        echo "  sudo cp $WORKING_DIR/$SERVICE_FILE /etc/systemd/system/"
        echo "  sudo systemctl daemon-reload"
        echo "  sudo systemctl enable job-tracker"
        echo "  sudo systemctl start job-tracker"
    fi
else
    echo "Installation du service ignorée."
fi
