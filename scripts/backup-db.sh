#!/usr/bin/env bash
set -euo pipefail
# Backup GetAxe Postgres database using DATABASE_URL or first arg.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local" 2>/dev/null || true
  set +a
fi
URL="${1:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "Usage: DATABASE_URL=... $0   or   $0 postgres://..."
  exit 1
fi
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}"
mkdir -p "$OUT_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="$OUT_DIR/getaxe-$STAMP.dump"
echo "Backing up to $FILE"
pg_dump --format=custom --no-owner --no-acl "$URL" -f "$FILE"
echo "OK: $FILE"
ls -lh "$FILE"
