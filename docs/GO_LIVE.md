# GetAxe POS — Go-live guide (pharmacy / retail)

## Version 1 scope

Supported for **controlled go-live**: product catalogue, multi-unit stock, batch/expiry/serials, PO → GRN → AP pay, POS (cash/credit), AR collect, expenses/other income, journals hybrid reports, reconciliation, readiness checklist.

**Deferred to v2 (P2):** full eTIMS device integration, advanced clinical pharmacy (interactions, cold chain, recall engines), HR/payroll, multi-currency line FX, deep CRM campaigns.

## Day-0 checklist (required)

1. **Platform** invite owner → set password → create business.
2. **Settings → Go-live readiness** — complete all required steps (score 100%).
3. **Branch + warehouse** active.
4. **Capabilities** — enable only what you need (pharmacy core, batch, expiry, serials if needed).
5. **Finance → Cash & bank** — confirm each till has its **own** ledger (1000 / 1100 / 1110 / 1120 / 1130). Fix if shared.
6. **Units + tax** defaults.
7. **Products** (wizard or import) — packaging factors correct (1 box = N tablets).
8. **Opening balances** (existing shop): opening cash per till + opening stock with cost, batch, expiry. **Do not** use a fake PO for pre-app stock.
9. **Supplier** + optional first PO → GRN → supplier invoice.
10. **Smoke day** (below) before first real customer.

## Pharmacy smoke day

1. Create one medicine with batch + expiry tracking; mark controlled if schedule applies.
2. Receive opening or GRN with batch/expiry.
3. POS **Browse** and **Scan**: pick FEFO batch; complete **cash sale**.
4. **Credit invoice** to KYC customer → **Receivables** collection to correct till.
5. Record **other income** + **expense**.
6. Pay one **supplier invoice** from a chosen till.
7. **Daily reconciliation** (day-only then full till if needed).
8. Reports: **P&L**, **Expenses 2-column** (GP + other income | expenses), **stock matrix**, **balance sheet**.

## Backup & restore

```bash
# One-off backup (from project root, DATABASE_URL set)
./scripts/backup-db.sh

# Install daily cron (default 02:15 local time; keeps 14 days)
./scripts/install-backup-cron.sh
# Optional: CRON_HOUR=3 CRON_MIN=0 KEEP_DAYS=21 ./scripts/install-backup-cron.sh

# Restore (DANGER — overwrites DB)
./scripts/restore-db.sh path/to/backup.dump
```

Dumps land in `backups/`; log in `backups/backup.log`. Run a restore drill on a **staging** database before production go-live.

## Staff SOP (printout)

- In-app: **Settings → Staff SOP (print)** → browser Print (Ctrl+P).
- Markdown: `docs/STAFF_SOP.md` (same content for Word/PDF export).

## POS vs Dispensing

- **POS**: sell + take payment (or credit invoice). Use for normal counter sales.
- **Dispensing** (`pharmacy.dispensing`): clinical dispense log / issue when enabled — does not replace POS payment unless your SOP says dispense then charge at POS.

## Controlled medicines

Enable capability **pharmacy.controlled-medicines**. On the product, tick **Controlled medicine**. Sales of those products appear under **Pharmacy → Controlled register**.

## Support contacts

Document your internal admin, DB host, and backup location here after deployment.
