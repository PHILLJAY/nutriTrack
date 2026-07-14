#!/bin/sh

# Create persistent directories
mkdir -p /data/db /data/uploads

# Symlink uploads to persistent storage
rm -rf /app/public/uploads
ln -s /data/uploads /app/public/uploads

# Run migrations against the persistent database
DATABASE_URL="file:/data/db/dev.db" npx prisma migrate deploy

# Start the Discord bot in the background (non-fatal if it fails)
(npm run bot 2>&1 || echo "Discord bot failed to start — check DISCORD_BOT_TOKEN and intents") &

# Start Next.js with the persistent database
export DATABASE_URL="file:/data/db/dev.db"
exec npm start
