#!/usr/bin/env bash
set -euo pipefail
# Restore a custom-format dump created by backup-db.sh
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local" 2>/dev/null || true
  set +a
fi
DUMP="${1:-}"
URL="${2:-${DATABASE_URL:-}}"
if [[ -z "$DUMP" || -z "$URL" ]]; then
  echo "Usage: $0 backup.dump [DATABASE_URL]"
  exit 1
fi
echo "WARNING: This overwrites the target database."
read -r -p "Type RESTORE to continue: " CONFIRM
[[ "$CONFIRM" == "RESTORE" ]] || { echo "Aborted"; exit 1; }
pg_restore --clean --if-exists --no-owner --no-acl -d "$URL" "$DUMP"
echo "Restore finished."
