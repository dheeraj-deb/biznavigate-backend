#!/usr/bin/env zsh
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Export it before running." >&2
  exit 1
fi

# Optional backup (requires pg_dump)
# pg_dump "$DATABASE_URL" -Fc -f "backup_$(date +%Y%m%d_%H%M%S).dump"

echo "Running DB cleanup on $DATABASE_URL"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/db_cleanup.sql

echo "Applying Prisma schema"
npx prisma db push --accept-data-loss
npx prisma generate

echo "DB cleanup complete."