# GRU QR Voucher System (Cloudflare Pages)

App de vouchers aeroportuários para Cloudflare Pages usando:
- Frontend estático em `public/`
- Backend em Cloudflare Pages Functions em `functions/api/`

## Entregue nesta versão

- Login de operador por matrícula
- Emissão de voucher:
  - Refeição (`normal` e `INAD`)
  - Hotel (com quantidade de quartos)
- Últimos vouchers emitidos
- Login de supervisor (separado)
- Área de administração para supervisor (CRUD de Vendors e Hotels)
- Relatórios com filtros (`staffNumber`, `category`, `from`, `to`, `limit`)
- Envio de e-mail com provider (Resend ou SendGrid)
- Persistência com D1 quando binding `DB` existe
- Fallback para memória quando D1 não estiver configurado

## Rotas API

Obrigatórias:
- `POST /api/login`
- `GET /api/vendors`
- `GET /api/hotels`
- `POST /api/issue-meal`
- `POST /api/issue-hotel`
- `GET /api/latest`
- `POST /api/report`
- `POST /api/send-email`

Novas:
- `POST /api/supervisor-login`
- `GET /api/reports`
- `GET /api/admin/vendors`
- `POST /api/admin/vendors`
- `PUT /api/admin/vendors`
- `DELETE /api/admin/vendors?id=<id>`
- `GET /api/admin/hotels`
- `POST /api/admin/hotels`
- `PUT /api/admin/hotels`
- `DELETE /api/admin/hotels?id=<id>`

## Configuração local

Pré-requisitos:
- Node.js 18+
- Wrangler (`npm i -g wrangler`)

1. (Opcional) Login no Cloudflare:

```bash
wrangler login
```

2. Crie/aplique D1 para persistência real:

```bash
wrangler d1 create qrgruvoucher-db
wrangler d1 execute qrgruvoucher-db --local --file=db/schema.sql
```

3. Atualize `wrangler.toml` com IDs reais do D1.

4. Defina segredos:

```bash
wrangler secret put SUPERVISOR_PIN
wrangler secret put EMAIL_FROM
wrangler secret put RESEND_API_KEY
# ou
wrangler secret put SENDGRID_API_KEY
```

5. Rode localmente:

```bash
wrangler pages dev public --compatibility-date=2026-03-06
```

## Deploy no Cloudflare Pages

1. Push para GitHub
2. Pages > Create project
3. Build command vazio; output `public`
4. Configure binding D1 `DB` e secrets
5. Deploy
