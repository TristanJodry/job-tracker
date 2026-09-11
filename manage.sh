#!/bin/bash

# Simple script to manage users and database from CLI

DB_FILE="db.json"

function show_help() {
    echo "Usage: ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  users:list          List all users"
    echo "  user:add            Add a new user"
    echo "  user:delete         Delete a user"
    echo "  db:reset            Reset database (DANGEROUS)"
    echo "  db:backup           Create a backup of db.json"
}

function list_users() {
    echo "--- Liste des utilisateurs ---"
    node -e "const db = require('./db.json'); db.users.forEach(u => console.log(\`- \${u.username} (\${u.role}) [ID: \${u.id}]\`))"
}

function add_user() {
    read -p "Nom d'utilisateur: " username
    read -s -p "Mot de passe: " password
    echo ""
    read -p "Rôle (admin/user): " role
    
    # Hash password using node
    hashed_password=$(node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('$password', 10))")
    
    node -e "
    const fs = require('fs');
    const db = JSON.parse(fs.readFileSync('$DB_FILE'));
    const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        username: '$username',
        password: '$hashed_password',
        role: '$role' || 'user'
    };
    db.users.push(newUser);
    fs.writeFileSync('$DB_FILE', JSON.stringify(db, null, 2));
    console.log('Utilisateur ajouté avec succès !');
    "
}

function delete_user() {
    read -p "ID de l'utilisateur à supprimer: " uid
    node -e "
    const fs = require('fs');
    const db = JSON.parse(fs.readFileSync('$DB_FILE'));
    const initialCount = db.users.length;
    db.users = db.users.filter(u => u.id !== '$uid');
    if (db.users.length < initialCount) {
        fs.writeFileSync('$DB_FILE', JSON.stringify(db, null, 2));
        console.log('Utilisateur supprimé.');
    } else {
        console.log('Utilisateur non trouvé.');
    }
    "
}

case "$1" in
    "users:list")
        list_users
        ;;
    "user:add")
        add_user
        ;;
    "user:delete")
        delete_user
        ;;
    "db:backup")
        cp db.json db.json.bak
        echo "Backup created: db.json.bak"
        ;;
    *)
        show_help
        ;;
esac
