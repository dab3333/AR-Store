# AR Store

T-shirt e-commerce app for a Philippines-based custom/graphic shop, rewritten as
**React + Spring Boot + PostgreSQL** from a legacy PHP/XML app.

- [`backend/`](backend/) — Spring Boot 3 REST API (JWT auth, JPA/PostgreSQL, admin CRUD)
- [`frontend/`](frontend/) — React (Vite) SPA consuming the API

The legacy PHP/XML app this was migrated from has been removed. Its product catalog was ported once into `backend/src/main/resources/seed/products.xml` (still read by the backend's seeder on first run), and its product images were copied into `frontend/public/uploads/`.

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for stack details, environment variables, and design notes/deviations from the migration spec.

## Running locally

1. Start Postgres:

   ```
   docker compose up -d
   ```

2. Backend (in `backend/`): copy `.env.example` to `.env`, fill in values (defaults match the `docker-compose.yml` Postgres creds), then:

   ```
   mvn spring-boot:run -Dspring-boot.run.profiles=dev,seed
   ```

   First run with `seed` loads the real product catalog from `XML files/products.xml` and creates a seed admin (`admin` / `ChangeMe123!` — change it).

3. Frontend (in `frontend/`): copy `.env.example` to `.env`, fill in `VITE_API_BASE_URL` (e.g. `http://localhost:8080/api`) and `VITE_RECAPTCHA_SITE_KEY`, then:

   ```
   npm install
   npm run dev
   ```

4. Open the printed Vite dev URL (default `http://localhost:5173`).

## Tests

- Backend: `cd backend && mvn test` (runs against in-memory H2, no external services needed)
- Frontend: `cd frontend && npm run build` (type/build check); no test suite yet

## Notable changes vs. the legacy app

The legacy app stored data in flat XML files with plaintext passwords, hardcoded SMTP/reCAPTCHA secrets in source, and no admin-authorization checks on some endpoints. This rewrite fixes all of that: BCrypt-hashed passwords, secrets read from environment variables only, `ROLE_ADMIN` enforced uniformly on every admin endpoint, a real transactional checkout (no partial-write risk), and a token-based (not plaintext-email) password reset flow. See each subproject's README for the full list of deviations and judgment calls made during the migration.
