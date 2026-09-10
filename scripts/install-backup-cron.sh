#!/usr/bin/env bash
set -euo pipefail
# Install a daily cron job for GetAxe DB backup (default 02:15 local time).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CRON_HOUR="${CRON_HOUR:-2}"
CRON_MIN="${CRON_MIN:-15}"
JOB_TAG="# getaxe-pos-backup"
BACKUP_SCRIPT="$ROOT/scripts/backup-db.sh"
if [[ ! -x "$BACKUP_SCRIPT" ]]; then
  chmod +x "$BACKUP_SCRIPT"
fi
# Load env in cron via wrapper
WRAPPER="$ROOT/scripts/run-backup-cron.sh"
cat > "$WRAPPER" << WRAP
#!/usr/bin/env bash
set -euo pipefail
cd "$ROOT"
export PATH="/usr/local/bin:/usr/bin:/bin:\${PATH:-}"
# Prefer .env.local then .env for DATABASE_URL
if [[ -f "$ROOT/.env.local" ]]; then set -a; source "$ROOT/.env.local"; set +a; fi
if [[ -f "$ROOT/.env" ]]; then set -a; source "$ROOT/.env"; set +a; fi
exec "$ROOT/scripts/backup-db.sh"
WRAP
chmod +x "$WRAPPER"

LINE="$CRON_MIN $CRON_HOUR * * * $WRAPPER $JOB_TAG"
# Remove old getaxe backup lines, append new
TMP=$(mktemp)
crontab -l 2>/dev/null | grep -v "getaxe-pos-backup" | grep -v "run-backup-cron.sh" > "$TMP" || true
echo "$LINE" >> "$TMP"
crontab "$TMP"
rm -f "$TMP"
echo "Installed cron:"
echo "  $LINE"
echo "Dumps: \$BACKUP_DIR or $ROOT/backups (KEEP_DAYS=${KEEP_DAYS:-14})"
echo "Log: backups/backup.log"
echo "List: crontab -l | grep getaxe"
echo "Remove: crontab -l | grep -v getaxe-pos-backup | crontab -"
