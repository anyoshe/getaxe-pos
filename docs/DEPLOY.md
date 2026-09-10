# GetAxe POS — Production deploy

## Requirements

- Node.js 20+ and pnpm
- PostgreSQL 15 or 16
- HTTPS reverse proxy (nginx, Caddy, or cloud LB)
- `pg_dump` / `pg_restore` on the DB host for backups

## Environment

```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/getaxe_pos
JWT_SECRET=<long-random>
AUTH_SECRET=<long-random>
# Optional
BACKUP_DIR=/var/backups/getaxe
KEEP_DAYS=14
```

## First deploy

```bash
pnpm install --frozen-lockfile
pnpm db:migrate
pnpm db:sync-capabilities   # if used in your pipeline
pnpm build
pnpm start                  # or pm2/systemd
```

Health check: `GET /api/health` → `{ "ok": true, "database": "up" }`.

## Ongoing

```bash
./scripts/install-backup-cron.sh
./scripts/backup-db.sh   # smoke backup
```

After each release: migrate → build → restart → hit `/api/health`.

## Business go-live

Follow `docs/GO_LIVE.md`, then print `Settings → Staff SOP`.
