# StockPulse — Military Inventory Management System

Система управління логістикою військових складів, побудована на **Next.js 16** (App Router) з **Supabase** (PostgreSQL) та підтримкою деплою на **Netlify**.

Власна система аутентифікації користувачів була зроблена щоб зменшити підв'язку до зовнішнього сервісу та полегшити майбутню міграцію під інші БД. Це необхідно для більш гнучкого розгортування системи у полі на локалькій БД.

## TODO:
- [x] Реалізувати CRUD систему на InMemory БД
- [x] Підв'язати систему до якоїсь БД
   - [ ] Виправити з'явившийся баг (має вплив на локальний сервер) CPU-Burn
- [x] Реалізувати Аутентифікацію користувачів через iron-session+bcrypt
- [x] Зробити гарненкі інтерфейс 😊
- [ ] Реалізувати фільтрування SKU по рівню доступу користувача
- [ ] Реалізувати відокремлення айтемів на ієрархію складів базовану на Cortex-подібній системі
   - [ ] Реалізувати відображення де і скільки знаходиться тих айтемів
   - [ ] Реалізувати автоматичне/ручне підвантаження айтемів у малі(польові) склади

## Стек технологій

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI), Lucide Icons
- **State Management**: TanStack Query v5
- **Forms**: React Hook Form + Zod validation
- **Auth**: iron-session (cookie-based sessions)
- **Database**: Supabase (PostgreSQL) via @supabase/supabase-js
- **Deployment**: Netlify з @netlify/plugin-nextjs

## Налаштування Supabase

### 1. Створити проєкт на Supabase

1. Зайти на [supabase.com](https://supabase.com) → New Project
2. Обрати назву, пароль, регіон (EU Central рекомендовано)
3. Почекати поки проєкт створиться

### 2. Створити таблиці

Відкрити **SQL Editor** у Supabase Dashboard та виконати:

1. Спочатку `supabase/schema.sql` — створює таблиці `products` та `users`
2. Потім `supabase/seed.sql` — заповнює початковими даними (admin + 10 продуктів)

### 3. Отримати ключі

У **Supabase Dashboard → Settings → API** скопіювати:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **service_role key** (secret!) → `SUPABASE_SERVICE_ROLE_KEY`

## Запуск локально

```bash
# 1. Встановити залежності
npm install

# 2. Скопіювати та заповнити env файл
cp .env.local.example .env.local
# Відредагувати .env.local — вставити Supabase URL та ключі

# 3. Запустити dev сервер
npm run dev
```

Відкрити [http://localhost:3000](http://localhost:3000)

**Дані для входу:**
- Логін: `admin`
- Пароль: `admin123`

## Environment Variables

| Змінна | Де взяти | Опис |
|--------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | URL проєкту Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key | Секретний ключ (НЕ anon key!) |
| `SESSION_SECRET` | Згенерувати самостійно (32+ символів) | Ключ шифрування cookies |

## Збірка

```bash
npm run build
```

## Деплой на Netlify

1. Завантажити репозиторій на GitHub
2. Підключити репозиторій до Netlify
3. **У Netlify Dashboard → Site → Environment variables** додати:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
4. Netlify автоматично підхопить `netlify.toml` та збере проєкт

Або через Netlify CLI:
```bash
npx netlify-cli deploy --prod
```

## Структура проєкту

```
src/
├── app/
│   ├── api/                  # API Route Handlers (backend)
│   │   ├── auth/
│   │   │   ├── login/        # POST /api/auth/login
│   │   │   ├── logout/       # POST /api/auth/logout
│   │   │   └── me/           # GET /api/auth/me
│   │   ├── products/         # CRUD /api/products
│   │   ├── categories/       # GET /api/categories
│   │   ├── stats/            # GET /api/stats
│   │   └── users/            # CRUD /api/users (admin)
│   ├── globals.css           # Tailwind CSS + тема
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Entry point (auth gate)
├── components/
│   ├── pages/                # Page components
│   │   ├── login.tsx
│   │   ├── dashboard.tsx
│   │   ├── products.tsx
│   │   ├── product-form.tsx
│   │   └── users.tsx
│   ├── ui/                   # shadcn/ui components
│   ├── app-shell.tsx         # Layout з sidebar
│   └── providers.tsx         # React Query + Auth providers
├── hooks/
│   ├── use-auth.tsx          # Auth context + hooks
│   └── use-toast.ts          # Toast notifications
└── lib/
    ├── auth.ts               # iron-session auth helpers
    ├── queryClient.ts        # TanStack Query config
    ├── schema.ts             # Types, Zod schemas, constants
    ├── storage.ts            # Supabase storage layer
    ├── supabase.ts           # Supabase client
    └── utils.ts              # cn() helper

supabase/
├── schema.sql                # SQL схема таблиць
└── seed.sql                  # Початкові дані (admin + products)
```

## Особливості

- **Supabase PostgreSQL**: дані зберігаються надійно, не скидаються при перезапуску
- **Військовий профіль**: 21 звання ЗСУ, 5 рівнів допуску, позивний, підрозділ
- **Ролі**: admin (повний доступ) та user (тільки продукти)
- **Dashboard**: статистика, алерти low stock / out of stock
- **Products**: CRUD, пошук, фільтр категорій, сортування
- **Users**: створення/редагування/видалення (тільки admin)
- **Dark mode**: підтримка темної теми
- **Cookie-based auth**: iron-session (серверна сесія)
- **Netlify-ready**: повна сумісність з Netlify serverless
