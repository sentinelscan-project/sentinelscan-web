# SentinelScan Web (`sentinelscan-web`)

## Overview
`sentinelscan-web` is the web frontend service for the **SentinelScan** authorized web application security assessment platform. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS.

Stage 7 implements the full security assessment interface:
- **Authentication**: Session cookies via HttpOnly JWT, session guards, and login/registration.
- **Security Dashboard**: High-level metrics, active targets, recent scans, and findings distribution based on real API data.
- **Targets Management**: Authorized target registry, validation, status toggles, and direct scan triggering.
- **Target Detail**: Target configuration, historical scan records, and active assessment controls.
- **Scans & Live Status**: Scan list, filtering by status, polling for running scans with terminal status cutoff, and cancellation.
- **Findings Explorer**: Scoped finding queries, severity/confidence/category filtering, and pagination.
- **Finding Detail & Safe Evidence**: Complete technical breakdown (CWE, WASC, remediation, attack payload, evidence), rendered with strict plain-text escaping (zero dangerous raw HTML execution).
- **AI Security Analyst UX**: Contextual analysis layer powered by Google Gemini (via `sentinelscan-api`), presenting executive summaries, methodology limitations, finding correlations, compounding risk, and separate AI priority distinct from scanner severity.

---

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Containerization**: Docker (multi-stage)
- **CI/CD**: GitHub Actions (Primary CI), Jenkins

---

## Prerequisites
- **Node.js**: v20.x or v22.x LTS (v24 compatible)
- **npm**: v10.x or higher
- **Docker**: v24+ (optional for containerized runtime)

---

## Environment Variables
Create a local `.env.local` file by copying the template:

```bash
cp .env.example .env.local
```

### Supported Variables
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Base URL of the `sentinelscan-api` service | `http://localhost:4000` |
| `NEXT_OUTPUT` | Set to `standalone` only for container builds (see [Deployment](#deployment)) | _unset_ |

The currently deployed API is `https://sentinelscan-api.onrender.com`. Set
`NEXT_PUBLIC_API_URL` to that value to run the frontend against it.

> **Security Rule**: Never commit `.env` or `.env.local` files to Git. Credentials and secrets must not be stored in source control.

> **Frontend secrets rule**: `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so only public configuration belongs here. The backend's `JWT_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_SECRET`, and `ZAP_API_KEY` belong to `sentinelscan-api` and must never be set in this project or in its Vercel environment.

### Cross-origin requirements
The API sets its session cookie on its own origin, so it must allow the web app's origin with credentials (`Access-Control-Allow-Origin: <web origin>` plus `Access-Control-Allow-Credentials: true`). When the two are on different sites, the cookie must be issued as `SameSite=None; Secure` by the API.

---

## Installation & Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url> sentinelscan-web
   cd sentinelscan-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify code quality & run tests**:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. Sign-in
   and registration require `sentinelscan-api` to be reachable at
   `NEXT_PUBLIC_API_URL` and to allow this origin with credentials.

5. **Build and run production bundle**:
   ```bash
   npm run build
   npm run start
   ```

---

## Application Structure

```
app/
  page.tsx                 Public landing page (auth modal)
  login/, register/        Directly linkable auth routes
  auth/callback/           Return point for the backend Google OAuth flow
  (app)/                   Authenticated route group — guarded by its layout
    dashboard/ targets/ scans/ findings/ reports/ settings/
components/
  auth/                    Auth provider, guards, forms, modal
  landing/                 Landing sections and their visualisations
  motion/                  Scroll-reveal primitives (IntersectionObserver)
  app-shell/               Navigation frame for the authenticated area
  ui/                      Shared primitives (button, field, alert, ...)
lib/
  api.ts                   API client: base URL, credentials, JSON, errors
  auth.ts                  Auth endpoint calls and the AuthUser shape
  routes.ts                Navigation config and redirect sanitisation
```

## Design system

Tokens live in `app/globals.css` under Tailwind's `@theme`: a deep-navy base
(`abyss`, `navy`, `surface`, `raised`, `hairline`) with a meaning-carrying accent
ramp — `brand` (cyan, discovery), `beam` (blue, scanning), `arc` (violet, AI
analysis), and `safe` (emerald, verified). Accents indicate what a thing is, so
new UI should reuse the existing mapping rather than pick a colour by taste.

Scroll animation is built on `IntersectionObserver` plus CSS transitions — there
is no animation library. `components/motion/use-in-view.ts` reports when an
element arrives; `Reveal` wraps ordinary content, and the visualisations put one
observer on their root and let CSS stagger the children through a `--i` custom
property. Every animation is decorative: `prefers-reduced-motion: reduce` shows
final states immediately, and a `@media (scripting: none)` fallback keeps
content visible when scripts do not run.

## Authentication

The API is the only authority on the session. It issues a JWT in an **HttpOnly
cookie**, which JavaScript cannot read, so the frontend never stores or inspects
a token — not in `localStorage`, `sessionStorage`, React state, or a URL.

- Every request goes through `apiFetch` in [`lib/api.ts`](lib/api.ts), which sets
  `credentials: "include"` in one place.
- `AuthProvider` resolves `loading → authenticated | unauthenticated` on startup
  by calling `GET /auth/me`, and re-reads it after every sign-in.
- Protected pages live in the `app/(app)` route group. Its layout wraps them in
  `RequireAuth`, which renders a loading screen until the session is resolved and
  redirects to `/login?next=<path>` when there is none. Adding a page to that
  group is all that is needed to protect it.
- `/login` and `/register` stay public and send an already-authenticated visitor
  to the dashboard, so the two guards cannot loop.
- `POST /auth/register` deliberately does not open a session. After a successful
  registration the user is guided to sign in.
- Google sign-in is owned by the backend: the button navigates the browser to
  `GET /auth/google`. No Google client ID or secret exists in this project.
- Logout calls `POST /auth/logout` with credentials so the API can clear the
  cookie, then clears local state and returns to the public site.

### API endpoints used
`POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `POST /auth/logout` ·
`GET /auth/google` · `GET /auth/google/callback`

---

## Deployment

### Vercel (standard Next.js integration)
Vercel builds this project with its own Next.js integration. Set only
`NEXT_PUBLIC_API_URL` in the Vercel project environment — never a backend secret.

`next.config.ts` must **not** enable `output: "standalone"` on Vercel. Standalone
is a self-hosting mode: it resolves the build's file traces into `.next/standalone`
and that tree does not contain the trace manifests (`.next/next-server.js.nft.json`)
that Vercel's post-build step reads, which made deployments fail with
`ENOENT: no such file or directory, open '/vercel/path0/.next/next-server.js.nft.json'`.
The config therefore enables standalone only when `NEXT_OUTPUT=standalone` is set,
which happens exclusively in the `Dockerfile`.

---

## Docker

### Build the Image
```bash
docker build -t sentinelscan-web .
```

### Run the Container
```bash
docker run -p 3000:3000 --env-file .env.local sentinelscan-web
```

---

## CI/CD Pipeline
GitHub Actions is the primary CI system for this repository (`.github/workflows/ci.yml`), automatically triggered on pushes and pull requests targeting the `main` branch. The repository also retains the declarative `Jenkinsfile` as an alternative CI pipeline.

### GitHub Actions (Primary CI)
The workflow runs on `ubuntu-latest` and executes the following steps:
1. **Checkout repository**: Retrieves source code from Git (`actions/checkout@v4`).
2. **Set up Node.js 22**: Configures Node.js LTS v22 with npm dependency caching (`actions/setup-node@v4`).
3. **Install dependencies**: Runs clean package installation via `npm ci`.
4. **Lint**: Validates formatting and code standards (`npm run lint`).
5. **Typecheck**: Validates TypeScript strict types (`npm run typecheck`).
6. **Build**: Builds production bundle (`npm run build`).
7. **Docker Build**: Packages container image tagged `sentinelscan-web:ci` using multi-stage `Dockerfile` (no push).

### Jenkins Pipeline (Alternative)
The repository includes a declarative `Jenkinsfile` executing the following stages:
1. **Checkout**: Retrieves source code from Git.
2. **Install Dependencies**: Runs `npm ci`.
3. **Lint**: Validates formatting and code standards (`npm run lint`).
4. **Typecheck**: Validates TypeScript types (`npm run typecheck`).
5. **Test**: Stage placeholder for future unit and component tests.
6. **Build**: Builds production bundle (`npm run build`).
7. **Security Scan**: Placeholder stage for SAST and dependency auditing (e.g., `npm audit`).
8. **Container Scan**: Placeholder stage for container image vulnerability scanning.
9. **Docker Build**: Packages container image using multi-stage `Dockerfile`.

#### GitHub → Jenkins Webhook Integration (Future Setup)
When GitHub remotes and Jenkins are configured, push events will trigger builds automatically:
1. In the GitHub repository settings, navigate to **Webhooks** > **Add webhook**.
2. Set Payload URL: `https://<jenkins-host>/github-webhook/`.
3. Content type: `application/json`.
4. Trigger events: Just the `push` event and Pull Requests.
5. In Jenkins, enable **GitHub hook trigger for GITScm polling** on the pipeline job.

---

## Git Workflow & Two-Developer Collaboration
This repository operates on a clean branch-and-PR model:
- `main`: Protected production-ready branch.
- Feature/bugfix branches: Branch off `main` (e.g., `feature/init-auth`, `fix/nav-styling`).
- Collaboration process:
  1. Pull latest `main`: `git checkout main && git pull origin main`
  2. Create a working branch: `git checkout -b feature/<feature-name>`
  3. Commit focused changes with descriptive commit messages.
  4. Push the branch and open a Pull Request against `main`.
  5. Merge to `main` only after CI passes and peer review is approved.

### Adding GitHub Remote
To link this local repository to a remote repository on GitHub:
```bash
git remote add origin https://github.com/<org-or-user>/sentinelscan-web.git
git branch -M main
git push -u origin main
```

---

## Roadmap
`sentinelscan-web` deploys independently to Vercel or to a container host, and
reaches the API only through `NEXT_PUBLIC_API_URL`. Later stages build on the
authenticated shell established here:

Authentication → Dashboard → Targets → Scans → Findings → AI Analysis → Reports
