# Synap

> Smart todo prioritisation — take action, manage your time better.

Synap is a todo app built around the idea that simply _listing_ tasks isn't enough. It helps you understand what to work on, when, and in what order.

---

## Features

| Feature | Description |
|---|---|
| **Board** | Trello-style kanban board with lists and cards |
| **Prioritisation Matrix** | Eisenhower matrix grouping tasks by urgency × importance |
| **Action Planner** | Enter your available hours, get a prioritised task order with a Pomodoro timer |
| **Archive** | View all completed and archived tasks |
| **Customisation** | Change background colour, text colour, and font throughout the app |

---

## Tech Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Auth** — [NextAuth v5 (Auth.js)](https://authjs.dev) — Google, GitHub, Email/Password, Magic Link
- **ORM** — [Prisma 7](https://prisma.io)
- **Database** — PostgreSQL via [Neon](https://neon.tech)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/synap.git
cd synap
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local` (see [Environment Variables](#environment-variables) below).

### 4. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon pooler connection string (add `pgbouncer=true`) |
| `DIRECT_URL` | Neon direct connection string (no pooler — used for migrations) |
| `AUTH_SECRET` | Random secret for NextAuth (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Full URL of your app (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `EMAIL_SERVER_HOST` | SMTP host for magic link emails |
| `EMAIL_SERVER_PORT` | SMTP port |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password |
| `EMAIL_FROM` | Sender address for magic link emails |

See `.env.example` for a full template.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & register pages
│   ├── (dashboard)/     # Board, Matrix, Action, Archive, Settings
│   └── api/auth/        # NextAuth route handler
├── auth.ts              # NextAuth configuration
├── middleware.ts         # Route protection
├── lib/
│   └── prisma.ts        # Prisma client singleton
└── types/
    └── next-auth.d.ts   # Session type augmentation
prisma/
└── schema.prisma        # Database schema
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to your branch: `git push origin feat/my-feature`
5. Open a pull request

---

## License

MIT
