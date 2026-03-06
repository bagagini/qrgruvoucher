# GRU Airport Disruption Voucher System

Cloudflare Pages + Pages Functions + D1 + R2 voucher system for GRU disruption operations.

## D1 Binding (Required)

`wrangler.json` is configured with:
- `binding`: `DB`
- `database_name`: `qrgruvoucher-db`
- `database_id`: `eec919fb-c86d-47e4-9d42-9920f8c7a13a`

## Setup

1. Install Wrangler and login:

```bash
npm i -g wrangler
wrangler login
```

2. Apply D1 schema:

```bash
wrangler d1 execute qrgruvoucher-db --remote --file=database/schema.sql
```

3. Seed initial data:

```bash
wrangler d1 execute qrgruvoucher-db --remote --file=database/seed.sql
```

4. (Optional local) Apply to local D1:

```bash
wrangler d1 execute qrgruvoucher-db --local --file=database/schema.sql
wrangler d1 execute qrgruvoucher-db --local --file=database/seed.sql
```

5. Configure secrets for manual email:

```bash
wrangler secret put EMAIL_FROM
wrangler secret put RESEND_API_KEY
```

6. Run Pages locally:

```bash
wrangler pages dev public
```

## Deploy to Cloudflare Pages

1. Push repository to GitHub.
2. Create Pages project from this repo.
3. Build output directory: `public`.
4. In Pages settings, confirm bindings:
- D1 binding: `DB`
- R2 binding: `VOUCHER_FILES`
5. Deploy.

## Database Resilience

- Static frontend deploy does not depend on D1 tables.
- API routes return readable JSON setup errors (`DB_SETUP_REQUIRED`) when DB setup is incomplete.
- Missing/empty tables do not crash the static deployment.

## Core Business Rules Implemented

- Voucher types: Meal Normal, Meal INAD, Hotel
- INAD never shows monetary value
- INAD does not show flight/reason
- Hotel printed voucher shows only `Room: 1`
- QR code payload is only `voucher_id`
- Manual email flow to `grukkqr@br.qatarairways.com`

## Main API Routes

- `POST /api/login`
- `GET|PUT|POST /api/vendors`
- `GET|PUT|POST /api/hotels`
- `POST /api/issue-meal`
- `POST /api/issue-hotel`
- `GET /api/latest`
- `POST /api/report`
- `GET|POST /api/validate`
- `POST /api/send-email`
