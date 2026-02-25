# modular_api

Use-case centric toolkit for building modular APIs with Express.  
Define `UseCase` classes (input → validate → execute → output), connect them to HTTP routes, and get automatic Swagger/OpenAPI documentation.

> TypeScript port of [modular_api](https://pub.dev/packages/modular_api) (Dart/Shelf)

---

## Quick start

```ts
import { ModularApi, ModuleBuilder } from 'modular_api';

// ─── Module builder (separate file in real projects) ──────────
function buildGreetingsModule(m: ModuleBuilder): void {
  m.usecase('hello', HelloWorld.fromJson);
}

// ─── Server ───────────────────────────────────────────────────
const api = new ModularApi({ basePath: '/api' });

api.module('greetings', buildGreetingsModule);

api.serve({ port: 8080 });
```

```bash
curl -X POST http://localhost:8080/api/greetings/hello \
  -H "Content-Type: application/json" \
  -d '{"name":"World"}'
```

```json
{ "message": "Hello, World!" }
```

**Docs** → `http://localhost:8080/docs`  
**Health** → `http://localhost:8080/health`

See `example/example.ts` for the full implementation including Input, Output, UseCase with `validate()`, and the builder.

---

## Features

- `UseCase<I, O>` — pure business logic, no HTTP concerns
- `Input` / `Output` — DTOs with `toJson()` and `toSchema()` for automatic OpenAPI
- `Output.statusCode` — custom HTTP status codes per response
- `UseCaseException` — structured error handling (status code, message, error code, details)
- `ModularApi` + `ModuleBuilder` — module registration and routing
- `useCaseTestHandler` — unit test helper (no HTTP server needed)
- `cors()` middleware — built-in CORS support
- Swagger UI at `/docs` — auto-generated from registered use cases
- Health check at `GET /health` — [IETF Health Check Response Format](doc/health_check_guide.md)
- Prometheus metrics at `GET /metrics` — [Prometheus exposition format](doc/metrics_guide.md)
- All endpoints default to `POST` (configurable per use case)
- Full TypeScript declarations (`.d.ts`) included

---

## Installation

```bash
npm install modular_api
```

---

## Error handling

```ts
async execute() {
  const user = await repository.findById(this.input.userId);
  if (!user) {
    throw new UseCaseException({
      statusCode: 404,
      message: 'User not found',
      errorCode: 'USER_NOT_FOUND',
    });
  }
  this.output = new GetUserOutput(user);
}
```

```json
{ "error": "USER_NOT_FOUND", "message": "User not found" }
```

---

## Testing

```ts
import { useCaseTestHandler } from 'modular_api';

const handler = useCaseTestHandler(HelloWorld.fromJson);
const response = await handler({ name: 'World' });

console.log(response.statusCode); // 200
console.log(response.body); // { message: 'Hello, World!' }
```

---

## Architecture

```
HTTP Request → ModularApi → Module → UseCase → Business Logic → Output → HTTP Response
```

- **UseCase layer** — pure logic, independent of HTTP
- **HTTP adapter** — turns a UseCase into an Express RequestHandler
- **Middlewares** — cross-cutting concerns (CORS, logging)
- **Swagger UI** — documentation served automatically

---

## Dart version

This is the TypeScript port. The original Dart version is available at:

- **pub.dev**: [modular_api](https://pub.dev/packages/modular_api)
- **GitHub**: [macss-dev/modular_api](https://github.com/macss-dev/modular_api)

Both SDKs share the same architecture and API surface at v0.1.0.

---

## License

MIT © [ccisne.dev](https://ccisne.dev)
