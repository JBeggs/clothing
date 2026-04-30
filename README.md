# Clothing Store (Template 5)

Next.js 16 storefront for **[PLAN-05-CLOTHING.md](../PLAN-05-CLOTHING.md)**. Forked from the shared storefront stack with themes **Boutique** (default), **Streetwear**, and **Sustainable**. Dev server uses port **3008**. Default company slug: **`clothing`**.

## Quick start

```bash
cd clothing
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_COMPANY_SLUG as needed
npm run dev
```

Open [http://localhost:3008](http://localhost:3008).

## Backend

Same django-crm API as other templates. Provision a company (slug `clothing` or your choice) via `/admin/setup`. First-party catalog products use blank `supplier_slug`; checkout uses `isCourierGuyCartItem` — see PLAN-05 pitfall section.

## Themes

`data-theme`: `boutique` (default), `streetwear`, `sustainable`. Cookie / localStorage key: `site_theme`.

## Scripts

- `npm run dev` — dev server (port 3008)
- `npm run build` — production build
- `npm test` — Vitest
