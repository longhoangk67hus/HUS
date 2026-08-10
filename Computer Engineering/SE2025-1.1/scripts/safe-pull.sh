#!/bin/bash
# Script để git pull an toàn mà không mất file .env

set -e

echo "📦 Backing up .env file..."
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ .env backed up to .env.backup"
fi

echo "🔄 Pulling latest changes..."
git pull origin develop

echo "🔧 Restoring .env if needed..."
if [ -f .env.backup ]; then
    if [ ! -f .env ] || [ .env.backup -nt .env ]; then
        cp .env.backup .env
        echo "✅ .env restored from backup"
    fi
    # Keep backup for safety
    echo "📝 .env.backup kept for safety"
fi

echo "✨ Done! Your .env file is safe."
