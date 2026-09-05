# SentinelScan Web (`sentinelscan-web`)

## Overview
`sentinelscan-web` is the web frontend service for the **SentinelScan** application security platform. In Stage 0, this repository establishes the foundational Next.js application skeleton, build pipeline, Docker setup, and developer workflow.

> **Stage 0 Notice**: Application features (authentication, dashboards, scan management, AI interfaces, and reports) are deliberately not implemented at this stage. This repository contains only the minimal Next.js application foundation.

---

## Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Containerization**: Docker (multi-stage)
- **CI/CD**: Jenkins

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

> **Security Rule**: Never commit `.env` or `.env.local` files to Git. Credentials and secrets must not be stored in source control.

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

3. **Verify code quality**:
   ```bash
   npm run lint
   npm run typecheck
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser. The page displays the Stage 0 initialization confirmation message.

5. **Build and run production bundle**:
   ```bash
   npm run build
   npm run start
   ```

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

## CI/CD Pipeline (Jenkins)
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

### GitHub → Jenkins Webhook Integration (Future Setup)
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

## Future Deployment Architecture
In future stages:
- `sentinelscan-web` will be deployed independently to a serverless platform (e.g., Vercel) or a containerized host.
- API connectivity will be configured via environment variable `NEXT_PUBLIC_API_URL` without hardcoded localhost dependencies.
