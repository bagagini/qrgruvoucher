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
- Relatórios reais com filtros (`staffNumber`, `category`, `from`, `to`, `limit`)
- Envio de e-mail com provider real:
  - Resend (preferencial)
  - SendGrid (fallback)
- Persistência com D1 (quando binding `DB` existe)
- Fallback automático para memória (quando D1 não estiver configurado)

## Rotas API

Obrigatórias (mantidas):
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

## Configuração local

Pré-requisitos:
- Node.js 18+
- Wrangler (`npm i -g wrangler`)

1. (Opcional) Login no Cloudflare:

```bash
wrangler login
```

2. Instale e aplique schema D1 (se quiser testar persistência real):

```bash
wrangler d1 create qrgruvoucher-db
wrangler d1 execute qrgruvoucher-db --local --file=db/schema.sql
```

3. Atualize `wrangler.toml` com os IDs reais do D1.

4. Defina segredos (local/dev/prod):

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

Abra: `http://127.0.0.1:8788`

## Deploy no Cloudflare Pages

1. Push para GitHub.
2. Cloudflare Dashboard -> Pages -> Create project.
3. Configuração:
- Build command: vazio
- Build output directory: `public`
4. Em Settings -> Functions:
- Adicione binding D1 `DB`
- Configure secrets:
  - `SUPERVISOR_PIN`
  - `EMAIL_FROM`
  - `RESEND_API_KEY` (ou `SENDGRID_API_KEY`)
5. Deploy.

## Observações

- Sem D1 configurado, o app continua funcional via memória (dados não persistem entre reinícios).
- Para supervisor, o token é obrigatório em `GET /api/reports` via header:
  - `x-supervisor-token: <token>`
  - ou `Authorization: Bearer <token>`
- Esta versão foi mantida compatível com estrutura de Pages (`public` + `functions`).
