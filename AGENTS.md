# AI Agent Guidelines (AGENTS.md)

Welcome, AI Assistant! This document provides context and guidelines for working on the **ACML Community Platform**. Please follow these instructions to ensure consistency and quality in your contributions.

---

## 🚀 Project Mission
The **ACML Community Platform** is a digital solution for the Muslim association in Joliette (ACML). It aims to manage members, communications, finances, and educational activities through a centralized, easy-to-use platform.

---

## 🛠 Tech Stack
| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.12, Django 5.x, Django REST Framework |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS |
| **Database** | PostgreSQL 16 |
| **Tasks** | Celery + Redis |
| **DevOps** | Docker, Docker Compose |

---

## 🏗 Project Structure
- `backend/`: Django application logic.
  - `apps/`: Feature-specific modules (members, finance, events, etc.).
- `frontend/`: React single-page application.
- `nginx/`: Web server configuration for production.
- `docker-compose.yml`: Local development environment setup.

---

## 📜 Coding Standards & Guidelines

### Backend (Django/Python)
- **Style**: Follow PEP 8 guidelines.
- **Models**: Use UUIDs for primary keys. Document field choices using `models.TextChoices`.
- **APIs**: Use Django REST Framework. Prefer Class-Based Views (CBVs) and ViewSets.
- **Tasks**: Use Celery for long-running processes (e.g., sending emails/SMS).

### Frontend (React/TypeScript)
- **Components**: Functional components with hooks. Use descriptive names.
- **State**: Use React's built-in state or specialized stores (e.g., Zustand) for complex logic.
- **Styling**: Use Tailwind CSS. Favor utility classes over custom CSS unless necessary.
- **Types**: Always define TypeScript interfaces/types for props and API responses.

---

## 🤝 Collaboration Protocol
1. **Research First**: Before making significant changes, explore the existing codebase and documentation (`One Pager.md`, `architecture-monolith.md`).
2. **Atomic Changes**: Keep your changes focused and atomic. Avoid unnecessary refactoring unless requested.
3. **Clarify Uncertainty**: If a requirement is ambiguous, ask the user for clarification before proceeding.
4. **Documentation**: Keep `AGENTS.md`, `task.md`, and `implementation_plan.md` updated during your session.

---

## ⚠️ Constraints
- Do **not** modify security settings (e.g., `SECRET_KEY`, database credentials) in `.env` files unless explicitly asked.
- Do **not** introduce new large dependencies without consulting the user.
- Ensure all new features are covered by the existing Docker setup.

---

*Last updated: 2026-02-16*
