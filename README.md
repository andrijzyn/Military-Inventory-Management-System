# StockPulse — Military Inventory Management System
[Live demo](https://timely-croissant-26e162.netlify.app/)

A logistics management system for military stores built with **Next.js 16** (App Router), **Supabase** (PostgreSQL) and ready for deployment on **Netlify**.

The custom user‑authentication layer was created to minimise dependence on external services and to make future migrations to other databases easier. This provides greater flexibility when the system is deployed on‑premise with a local DB.

DB status – [link](https://timely-croissant-26e162.netlify.app/api/debug)

[![Netlify Status](https://api.netlify.com/api/v1/badges/bdf2edfe-59ca-4dc1-a32a-fd8d85621657/deploy-status)](https://app.netlify.com/projects/timely-croissant-26e162/deploys)

## TODO
- [x] Implement CRUD using an in‑memory DB
- [x] Connect the system to a real DB
  - [ ] Fix the burnout bug – #2
- [x] Implement authentication via **iron‑session** + **bcrypt**
- [x] Polish the UI 😊
  - [ ] Fix the design bug – #3
- [ ] Separate items into a hierarchical store structure based on a Cortex‑style system
  - [ ] Show where and how many of each item are stored
  - [ ] Implement automatic/manual loading of items into small (field) stores
- [ ] Optimise the design for mobile devices
- [ ] Restrict an account to a single authenticated user
- [ ] Add user‑action logging
- [ ] Filter SKUs by the user’s access level
- [ ] Create a tool to view product information by ID/location
- [ ] Build a form‑based tool for bulk location uploads
- [ ] Add extra filters and classifications to items (object type, security level, storage type)
- [ ] Develop a 3‑D matrix configuration tool for shelving
  - [ ] Allow marking a storage type per product
  - [ ] Allow marking a storage type per floor of a buffer zone
  - [ ] Account for weight and dimensions of goods
  - [ ] Provide a dashboard showing location load and quick access to product lists per location
- [ ] Conduct stress testing of the DB and host

## Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v3
- **UI components**: shadcn/ui (Radix UI), Lucide icons
- **State management**: TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Auth**: iron‑session (cookie‑based sessions)
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Deployment**: Netlify with `@netlify/plugin-nextjs`

## Setting up Supabase

### 1. Create a Supabase project
1. Visit [supabase.com](https://supabase.com) → **New Project**.
2. Choose a name, password and region (EU‑Central is recommended).
3. Wait for the project to be provisioned.

### 2. Create the tables
Open **SQL Editor** in the Supabase dashboard and run:
1. `supabase/schema.sql` – creates the `products` and `users` tables.
2. `supabase/seed.sql` – inserts initial data (admin + 10 products).

### 3. Retrieve the keys
In **Supabase Dashboard → Settings → API** copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## Running locally
```bash
# 1. Install dependencies
npm install

# 2. Copy and fill the env file
cp .env.local.example .env.local
# Edit .env.local – paste your Supabase URL and keys

# 3. Start the dev server
npm run dev
```
Open <http://localhost:3000> in your browser.

**Demo credentials**
- Username: `admin`
- Password: `admin123`

## Environment Variables
| Variable | Where to get it | Description |
|----------|-----------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | URL of the Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | Secret service‑role key (not the anon key) |
| `SESSION_SECRET` | Generate yourself (32 + characters) | Cookie‑encryption secret |

## Building
```bash
npm run build
```

## Contributing

We welcome contributions! To get started:

1. **Fork the repository** and clone your fork.
2. **Create a branch** for your work, following the naming convention `feature/<name>` or `bugfix/<name>`.
3. Install dependencies (`npm install`) and ensure the project builds locally (`npm run build`).
4. Run the linter and type‑check:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
5. Add or modify tests (if applicable) and ensure they pass:
   ```bash
   npm test   # or the test command defined in package.json
   ```
6. Commit with a clear, concise message and push to your fork.
7. Open a Pull Request against the `dev` branch.  Include a short description of the change, the problem it solves and any relevant issue numbers.

### Code style
- Follow the existing codebase conventions (Prettier, ESLint).  The repository ships with the appropriate configs, so running `npm run lint` will automatically format/fix most issues.
- Keep TypeScript types accurate; avoid using `any` unless absolutely necessary.
- Write small, focused commits – each should represent a single logical change.

### Review process
- A maintainer will review the PR, suggest any changes and merge once approvals are received.
- Ensure the CI pipeline (`npm run build`) passes before requesting review.

## Testing (optional)
The project currently does not have an extensive test suite, but you can add unit or integration tests using your preferred framework (e.g., Jest, Vitest).  Place test files alongside the modules they cover and name them `*.test.ts`.

---


