# Changelog
All notable changes to this project will be documented in this file.

The format loosely follows [Keep a Changelog](https://keepachangelog.com/)
and the project adheres to [Semantic Versioning](https://semver.org/).

### Documentation

## [0.2.0] - 2026-02-24
### Added
- **IETF Health Check Response Format** — `GET /health` now returns `application/health+json` following [draft-inadarei-api-health-check](https://datatracker.ietf.org/doc/html/draft-inadarei-api-health-check)
- `HealthCheck` abstract class — implement to register custom health checks (database, cache, queue, etc.)
- `HealthCheckResult` — result DTO with `status`, `responseTime` (ms), and optional `output`
- `HealthStatus` type — `'pass' | 'warn' | 'fail'` with worst-status-wins aggregation
- `HealthService` — executes checks in parallel with per-check configurable timeout (default: 5s)
- `HealthResponse` — aggregated response with `version`, `releaseId`, `checks` map, and `httpStatusCode` (200 for pass/warn, 503 for fail)
- `healthHandler()` — Express handler for `GET /health`
- `ModularApi.addHealthCheck()` — register health checks via method chaining
- `ModularApiOptions` now accepts `version` and optional `releaseId`
- `releaseId` defaults to `version-debug`; override via `process.env.RELEASE_ID`
- Test infrastructure: vitest + supertest

### Changed
- **BREAKING:** `GET /health` response changed from plaintext `ok` to JSON `application/health+json`
- **BREAKING:** `ModularApiOptions` extended — `version` parameter added (defaults to `'0.0.0'`)

## [0.1.0] - 2026-02-21
### Added
- **Initial release** — TypeScript port of [modular_api](https://pub.dev/packages/modular_api) (Dart)
- `UseCase<I, O>`, `Input`, `Output` — abstract base classes for use-case centric architecture
- `UseCaseFactory<I, O>` — type alias for static `fromJson` factories
- `UseCaseException` — structured error handling with `statusCode`, `message`, `errorCode`, `details`
- `ModularApi` — main orchestrator: module registration, middleware pipeline, Express server
- `ModuleBuilder` — fluent builder to register use cases as HTTP endpoints
- `useCaseHandler` — wraps any `UseCaseFactory` into an Express `RequestHandler`
- `useCaseTestHandler` — unit test helper (no HTTP server required)
- `cors()` middleware — configurable CORS with zero dependencies
- Automatic OpenAPI 3.0 spec generation from registered use cases
- Swagger UI auto-mounted at `GET /docs`
- Health check at `GET /health`
- All endpoints default to `POST` (configurable per use case)
- Schema introspection via `Input.toSchema()` / `Output.toSchema()`
- Custom HTTP status codes via `Output.statusCode` getter
- Full TypeScript declarations (`.d.ts`) included

### Stack
- Express 4.x
- swagger-ui-express 5.x
- TypeScript 5.x, strict mode, ES2020 target