# GRU Airport Disruption Voucher System

Cloudflare Pages + Pages Functions implementation for airline disruption vouchers at GRU.

## Stack

- Frontend: Cloudflare Pages (`public/`)
- Backend: Cloudflare Pages Functions (`functions/api/`)
- Database: Cloudflare D1
- File Storage: Cloudflare R2
- Language: Vanilla JavaScript + HTML + CSS

## Features

- Staff login by `staff_number`
- Voucher issuance:
  - Meal Normal
  - Meal INAD (Breakfast/Lunch/Dinner as separate vouchers)
  - Hotel
- Batch PDF generation (A4, one voucher per page)
- QR code generation (QR payload is voucher ID only)
- Manual email sending (PDF attachment only)
- Vendor/Hotel validation dashboard with PIN login
- Supervisor reports with filters and exports (CSV + PDF summary)
- Latest issued vouchers screen
- Supervisor configuration for vendors/hotels

## Business Rules Covered

- Use cases: delay, cancellation, misconnection, INAD
- Printable and operationally simple
- Mobile-friendly layout
- No intranet dependency
- QR content: voucher ID only (no public URL)
- INAD vouchers do not show value/flight/reason
- Hotel print always shows `Room: 1` (internal index only in metadata)

## Voucher ID Formats

- Meal Normal: `ALI-YYYYMMDD-00001`
- INAD:
  - `ALI-INAD-B-YYYYMMDD-00001`
  - `ALI-INAD-L-YYYYMMDD-00001`
  - `ALI-INAD-D-YYYYMMDD-00001`
- Hotel: `HOT-YYYYMMDD-00001`

## File Names

- Meal Normal: `MEAL_NORMAL_<flight>_<date>_<count>vouchers.pdf`
- INAD: `MEAL_INAD_<count>meals_<date>.pdf`
- Hotel: `HOTEL_<hotelcode>_<flight>_<date>_<count>rooms.pdf`

## API Routes

- `POST /api/login`
- `GET|PUT|POST /api/vendors`
- `GET|PUT|POST /api/hotels`
- `POST /api/issue-meal`
- `POST /api/issue-hotel`
- `GET /api/latest`
- `POST /api/report`
- `POST|GET /api/validate`
- `POST /api/send-email`

## Repository Structure

- `public/index.html`
- `public/app.js`
- `public/styles.css`
- `public/templates/meal-voucher.html`
- `public/templates/hotel-voucher.html`
- `functions/api/login.js`
- `functions/api/vendors.js`
- `functions/api/hotels.js`
- `functions/api/issue-meal.js`
- `functions/api/issue-hotel.js`
- `functions/api/latest.js`
- `functions/api/report.js`
- `functions/api/validate.js`
- `functions/api/send-email.js`
- `wrangler.json`

## Local Setup

1. Install Wrangler:

```bash
npm i -g wrangler
```

2. Login:

```bash
wrangler login
```

3. Create D1 database and apply schema:

```bash
wrangler d1 create qrgruvoucher-db
wrangler d1 execute qrgruvoucher-db --local --file=db/schema.sql
```

4. Update `wrangler.json` with real `database_id` and `preview_database_id`.

5. Create R2 buckets (or adjust names in `wrangler.json`):

```bash
wrangler r2 bucket create qrgruvoucher-files
wrangler r2 bucket create qrgruvoucher-files-preview
```

6. Set secrets for email provider (manual email flow):

```bash
wrangler secret put EMAIL_FROM
wrangler secret put RESEND_API_KEY
```

7. Run Pages locally:

```bash
wrangler pages dev public
```

## Deployment (Cloudflare Pages)

1. Push repository to GitHub.
2. In Cloudflare Dashboard, create Pages project from repo.
3. Build output directory: `public`.
4. Configure Functions bindings:
- D1 binding: `DB`
- R2 binding: `VOUCHER_FILES`
5. Configure secrets:
- `EMAIL_FROM`
- `RESEND_API_KEY`
6. Deploy.

## Operational Seed Data

Seeded at first run via backend:

- Vendors:
  - GRUPOFIT (VALUE 149.90)
  - VIENA (VALUE configurable, default 120)
  - DELI365 (VALUE 70)
- Hotels:
  - PULLMAN_GRU
  - PANAMBY_GRU
  - MARRIOTT_GRU
  - PANAMBY_BARRA
  - PULLMAN_IBIRA
  - IBIS_BUDGET_GRU
  - IBIS_COMFORT_GRU
- Staff:
  - Supervisor and agent sample records

Update PINs/config in supervisor screen or directly in D1.
