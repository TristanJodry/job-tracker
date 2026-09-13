#!/bin/bash

echo "--- Job Tracker Setup ---"

# Check dependencies
if [ ! -f "package.json" ]; then
    echo "Error: Run this script from the project root."
    exit 1
fi

# Port selection
read -p "Choisissez le port (par défaut 4000, appuyez sur Entrée ou tapez un autre port): " port
port=${port:-4000}

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
    
    read -p "Voulez-vous installer et lancer le service systemd maintenant ? (y/n): " run_service
    
    if [[ "$run_service" =~ ^[Yy]$ ]]; then
        echo "Installation et activation du service systemd..."
        cp $WORKING_DIR/$SERVICE_FILE /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable job-tracker
        systemctl start job-tracker
        echo "Service job-tracker installé, activé et démarré !"
    else
        echo "Installation manuelle requise :"
        echo "  cp $WORKING_DIR/$SERVICE_FILE /etc/systemd/system/"
        echo "  systemctl daemon-reload"
        echo "  systemctl enable job-tracker"
        echo "  systemctl start job-tracker"
    fi
else
    echo "Installation du service ignorée."
fi
