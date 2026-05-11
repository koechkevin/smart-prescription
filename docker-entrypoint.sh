#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/packages/server
npx prisma migrate deploy
cd /app

echo "Starting Smart Prescription server..."
exec "$@"
