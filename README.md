# CampusEvents — Campus Event Aggregator

A full-stack campus event platform built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, and Supabase.

---

## Prerequisites

Before you begin, make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | v18 or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | v9 or higher | Comes with Node.js |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

---

## VS Code Setup

### 1. Recommended Extensions

Open VS Code and install these extensions (click the Extensions icon in the sidebar or press `Ctrl+Shift+X`):

| Extension | ID | Purpose |
|-----------|----|---------|
| **ESLint** | `dbaeumer.vscode-eslint` | Linting & code quality |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Tailwind autocomplete & hover |
| **Prettier** | `esbenp.prettier-vscode` | Code formatting |
| **TypeScript Importer** | `pmneo.tsimporter` | Auto-import suggestions |
| **Error Lens** | `usernamehw.errorlens` | Inline error display |
| **Auto Rename Tag** | `formulahendry.auto-rename-tag` | HTML/JSX tag renaming |

### 2. VS Code Settings

Create or update `.vscode/settings.json` in the project root:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "'([^']*)'"],
    ["cn\\(([^)]*)\\)", "\"([^\"]*)\""]
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## Project Setup

### Step 1: Open the project in VS Code

```bash
# If you downloaded as a zip, extract it first, then:
cd campus-events
code .
```

### Step 2: Install dependencies

Open the VS Code terminal (`Ctrl+`` ` or `View > Terminal`):

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**Where to find these values:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy **Project URL** and **anon (public) key**

### Step 4: Set up the database

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql/new)
2. Open the file `supabase-migration.sql` from this project
3. Paste the entire contents and click **Run**
4. Then open `supabase-password-migration.sql` and run it too

This creates all tables (profiles, events, rsvps, reviews) and seeds demo data.

### Step 5: Run the development server

```bash
npm run dev
```

The app will be available at **[http://localhost:3000](http://localhost:3000)**

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## Project Structure

```
campus-events/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout (navbar, footer, providers)
│   │   ├── events/
│   │   │   ├── page.tsx        # Event listings with search/filters
│   │   │   └── [id]/page.tsx   # Event detail page
│   │   ├── calendar/page.tsx   # Interactive calendar
│   │   ├── login/page.tsx      # Login page
│   │   ├── register/page.tsx   # Registration page
│   │   ├── profile/page.tsx    # User profile + settings
│   │   ├── submit/page.tsx     # Event submission form
│   │   ├── admin/page.tsx      # Admin dashboard
│   │   └── api/                # API routes
│   │       ├── events/         # CRUD for events
│   │       ├── auth/           # Login, register, change password
│   │       ├── rsvps/          # RSVP management
│   │       ├── reviews/        # Event reviews
│   │       ├── users/          # User profiles
│   │       └── analytics/      # Dashboard analytics
│   ├── components/             # Reusable UI components
│   │   ├── navbar.tsx          # Navigation bar
│   │   ├── footer.tsx          # Footer
│   │   ├── event-card.tsx      # Event card component
│   │   ├── theme-switcher.tsx  # Dark/light mode toggle
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/                    # Utilities and data layer
│   │   ├── supabase/           # Supabase client (browser + server)
│   │   ├── auth-context.tsx    # Authentication context provider
│   │   ├── password.ts         # Password hashing (scrypt)
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── store.ts            # In-memory fallback store
│   │   └── utils.ts            # Utility functions
│   └── hooks/                  # Custom React hooks
├── .env.example                # Environment variables template
├── supabase-migration.sql      # Database schema + seed data
├── supabase-password-migration.sql  # Password column migration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── package.json                # Dependencies
```

---

## Demo Credentials

After running the SQL migrations, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Admin | alex.rivera@university.edu | Demo123 |
| Organizer | jordan.chen@university.edu | Demo123 |
| Organizer | sam.patel@university.edu | Demo123 |
| Student | taylor.kim@university.edu | Demo123 |
| Student | morgan.davis@university.edu | Demo123 |
| Student | casey.williams@university.edu | Demo123 |

---

## Features

- **Event Discovery** — Search, filter by category/date/location, sort
- **Interactive Calendar** — Month view with color-coded categories
- **RSVP System** — One-click RSVP with capacity tracking
- **Event Submission** — Auth-gated form with admin moderation
- **Reviews & Ratings** — 5-star ratings with text comments
- **User Profiles** — Edit name/email/avatar, change password
- **Admin Dashboard** — Analytics charts, event moderation, user management
- **Dark Mode** — Full dark theme support
- **Responsive** — Works on mobile, tablet, and desktop

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Custom password auth with scrypt hashing
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
