# AR Store Backend

Spring Boot 3 (Java 17+, Maven) REST API for the AR Store T-shirt e-commerce
app, migrated from a legacy PHP/XML app. The legacy source has since been
removed; its product catalog was ported once into
`src/main/resources/seed/products.xml`, which `DataSeeder` still reads on
first run under the `seed` profile.

## Stack

- Spring Boot 3.3, Java 17
- Spring Web, Spring Data JPA, Spring Security (stateless JWT), Bean Validation, Spring Mail
- PostgreSQL + Flyway migrations (`src/main/resources/db/migration`)
- JJWT for token issuing/parsing
- JUnit 5 + Mockito + H2 for tests

## Running locally

1. Have a local PostgreSQL instance with a database/user matching your env vars (defaults: db `arstore`, user/pass `arstore`/`arstore`).
2. Copy `.env.example` to `.env` (or otherwise export the same variables) and fill in real values. Nothing in `application.yml` has a real secret hardcoded - everything reads `${ENV_VAR:local-dev-default}`.
3. Run with the `dev` profile (local defaults + verbose SQL logging) and, on first run, the `seed` profile to load the catalog from the legacy `products.xml` and create a seed admin:

   ```
   mvn spring-boot:run -Dspring-boot.run.profiles=dev,seed
   ```

   On subsequent runs you can drop `seed` (it's a no-op anyway once the `collections` table isn't empty, but the profile also controls whether the seeder bean is registered at all).

4. Without Postgres available, `mvn test` runs the full test suite against an in-memory H2 database (profile `test`, see `src/test/resources/application-test.yml`) - no external services required.

## Seed data

- Catalog: `com.arstore.seed.DataSeeder` (active only under the `seed` profile) parses the bundled `src/main/resources/seed/products.xml` with the JDK's built-in DOM parser and creates one `Collection` + several `Product` rows per real collection (`dota`, `witcher`, `evolution`, `moneyHeist`, `naruto`, `weBareBears`, and the Mobile Legends collection). It deliberately skips creating rows for the legacy `featured` and `latest` collections, since those only ever contained duplicate copies of products that already exist elsewhere in the file. Instead, for each duplicate entry that carries a `<collection>realId</collection>` cross-reference, the seeder resolves it to the underlying real product (matched by image filename within the referenced collection - the most reliable join key in the source data) and sets `featured = true` on it. A cross-reference to a collection id that isn't a real collection in the file, or that has no image match, is skipped, per the migration spec.
- Admin user: username `admin`, email `admin@arstore.local`, role `ADMIN`, `verified = true`, password **`ChangeMe123!`** (placeholder - bcrypt-hashed in the DB, but change it immediately after first login via the reset-password flow, or by re-hashing and updating the row directly, since there's no "change my own password" endpoint in this initial API surface).

Location of the source XML is configurable via `app.seed.products-xml-path` / `SEED_PRODUCTS_XML_PATH` (default: `classpath:seed/products.xml`, i.e. the bundled copy under `src/main/resources/seed/`; pass a `file:` URL to point at a different XML file instead). Product/collection image URLs are seeded as `/uploads/<filename>` and served as a static asset by the frontend (see `frontend/public/uploads/`, copied from the legacy app's `uploads/` folder).

## Environment variables

See `.env.example` for the full list (DB connection, `JWT_SECRET`/expiry, SMTP creds, `RECAPTCHA_SECRET_KEY`, CORS origins, frontend base URL used to build email links, seed XML path).

## API surface

All endpoints are under `/api`. See the task spec / controllers under `src/main/java/com/arstore/controller` for the exact contract:

- `POST/GET /api/auth/*` - register (reCAPTCHA-gated + email verification), verify, login, forgot/reset password
- `GET /api/collections`, `GET /api/collections/{id}`, `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/search?q=`
- `GET/POST/PATCH/DELETE /api/cart*` - JWT-authenticated
- `POST /api/checkout` - JWT-authenticated, single transactional method
- `/api/admin/**` - JWT-authenticated + `ROLE_ADMIN` required (enforced both via the security filter chain and `@PreAuthorize` on every admin controller)

## Notable deviations / judgment calls from the spec

1. **Featured/latest product matching.** The spec says to set `featured=true` on "the real underlying product where the legacy `<collection>` cross-reference tag pointed to a real existing collection." The XML has no reliable id or name join between a duplicate entry in `featured`/`latest` and its real counterpart (ids and names are reused across unrelated products), but the `<image>` filename *is* consistently reused verbatim (verified by inspection, e.g. `moneyHeist` product 302 "Professor Shirt" has `image=professor.png`, and the `featured` duplicate 602 also has `image=professor.png`). The seeder therefore joins on lowercased image basename within the referenced collection. Where no image match exists within an otherwise-valid collection reference (this happens for a few entries, e.g. the `weBareBears`/`naruto` duplicates whose image files don't reuse a real product's image), the featured flag is simply not set for that reference - treated the same as a dangling collection id, per the spirit of "just skip" in the spec.
2. **`OrderStatus` persistence.** Stored as a `VARCHAR`, not a native Postgres enum type, specifically so new statuses can be added later via a plain Java enum + Flyway migration without an `ALTER TYPE`.
3. **Login identifier.** The spec's login endpoint takes "email+password"; `AppUserDetailsService` also accepts a username as a fallback for future flexibility, but the current `/api/auth/login` DTO only exposes an `email` field, matching the spec exactly.
4. **CORS `allowed-origins`** is a comma-separated string env var (`CORS_ALLOWED_ORIGINS`) rather than a list, to keep it a single simple env var; it's split on `,` in `SecurityConfig`.
5. **reCAPTCHA can be disabled** via `RECAPTCHA_ENABLED=false` (defaults to `true` everywhere, including the `dev` profile) purely so local registration testing doesn't require a live Google secret; production deployments should leave it enabled.
6. Password reset emails a **link**, not a plaintext password (explicitly required by the spec as a fix over the legacy behavior).

## Tests

`mvn test` covers:

- BCrypt password hashing round-trip (`PasswordHashingTest`)
- Checkout stock validation: rejects insufficient stock, decrements correctly on success, and leaves everything untouched (no partial writes) when a later cart line fails validation (`CheckoutServiceTest`)
- Cart quantity updates respecting live stock limits, including add/increment/decrement/removal-at-zero (`CartServiceTest`)
- Admin authorization: a non-admin JWT gets 403, a request with no token is rejected, and an admin JWT succeeds, against a full Spring context + H2 (`AdminAuthorizationIT`)
