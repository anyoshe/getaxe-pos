#!/usr/bin/env bash
set -euo pipefail
# Backup GetAxe Postgres. Optional: BACKUP_DIR, KEEP_DAYS (default 14), DATABASE_URL.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local" 2>/dev/null || true
  set +a
fi
if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env" 2>/dev/null || true
  set +a
fi
URL="${1:-${DATABASE_URL:-}}"
if [[ -z "$URL" ]]; then
  echo "Usage: DATABASE_URL=... $0   or   $0 postgres://..."
  exit 1
fi
OUT_DIR="${BACKUP_DIR:-$ROOT/backups}"
KEEP_DAYS="${KEEP_DAYS:-14}"
LOG_DIR="${BACKUP_LOG_DIR:-$OUT_DIR}"
mkdir -p "$OUT_DIR" "$LOG_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
FILE="$OUT_DIR/getaxe-$STAMP.dump"
LOG="$LOG_DIR/backup.log"
{
  echo "==== $(date -Is) backup start ===="
  echo "Target: $FILE"
  if ! command -v pg_dump >/dev/null 2>&1; then
    echo "ERROR: pg_dump not found. Install postgresql-client."
    exit 1
  fi
  pg_dump --format=custom --no-owner --no-acl "$URL" -f "$FILE"
  ls -lh "$FILE"
  # prune old dumps
  find "$OUT_DIR" -maxdepth 1 -name 'getaxe-*.dump' -type f -mtime +"$KEEP_DAYS" -print -delete || true
  echo "==== $(date -Is) backup OK (keep ${KEEP_DAYS}d) ===="
} | tee -a "$LOG"
