# YLZ CRM

Next.js 기반의 간단한 CRM 애플리케이션입니다. 고객, 파이프라인 단계, 태그 분류, 대시보드 화면을 제공합니다.

## Requirements

- Node.js 20+
- pnpm 10+
- Supabase-compatible API endpoint

## Environment

Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not commit real environment values or service role keys.

## Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

SQL setup files are in `supabase/`.

- `supabase/migrate-to-shared.sql`
- `supabase/add-inquiry-type-and-fix-stages.sql`
- `supabase/schema.sql`

## Deployment

`cloudbuild.yaml` is included as a Cloud Build / Cloud Run example. Configure your own project, secrets, and trigger settings before deploying.
