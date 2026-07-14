#!/bin/sh
set -e

# Symlink uploads to persistent storage
rm -rf /app/public/uploads
ln -s /data/uploads /app/public/uploads

# Ensure persistent DB directory exists
mkdir -p /data/db

# Run migrations against the persistent database
DATABASE_URL="file:/data/db/dev.db" npx prisma migrate deploy

# Start the Discord bot in the background
npm run bot &

# Start Next.js with the persistent database
export DATABASE_URL="file:/data/db/dev.db"
exec npm start
