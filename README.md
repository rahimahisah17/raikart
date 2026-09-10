# Raikart

Raikart is a modern, responsive full-stack e-commerce learning application inspired by premium sports and lifestyle brands. It is developed primarily as an open-source learning project for developers to understand:

- Full-stack JavaScript development (React/Vite + Node.js/Express)
- Docker and containerisation
- GitHub and CI/CD (GitHub Actions, GHCR)
- Kubernetes and optional AKS deployment

**Note:** This project is designed to be free to develop and run locally. Paid cloud infrastructure (like Azure) is completely optional and is provided only as a learning path.

## Project Structure

The planned project architecture follows a modular monolith approach:

```
raikart/
├── frontend/             # React, Vite, Tailwind CSS (Currently in root for development)
├── backend/              # Node.js, Express, Prisma (To be implemented)
├── k8s/                  # Kubernetes manifests (Future)
├── .github/workflows/    # CI/CD pipelines (Future)
├── docker-compose.yml    # Local container orchestration
├── .env.example          # Environment variables template
└── README.md
```

## Features
- **Frontend**: React 19, React Router, Tailwind CSS, Lucide Icons, Premium Athletic UI.
- **Backend**: Node.js, Express, PostgreSQL, Prisma (Coming in future stages).
- **Architecture**: Cleanly structured, beginner-friendly, and container-ready.

## Prerequisites
To run this project locally, you will need:
- Node.js
- Git
- Docker & Docker Compose (for database and full-stack local running)

## Local Setup (Frontend Only - Stage 1 & 2)

Currently, the frontend foundation and landing page are implemented.

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development Roadmap
- [x] **Stage 1**: Project structure and configuration.
- [x] **Stage 2**: Frontend foundation and landing page.
- [ ] **Stage 3**: Backend Express API.
- [ ] **Stage 4**: PostgreSQL + Prisma.
- [ ] **Stage 5-18**: Auth, Cart, Admin, Docker, Kubernetes, etc.

## License
MIT License
