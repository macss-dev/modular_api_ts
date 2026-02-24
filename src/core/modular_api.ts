// ============================================================
// core/modular_api.ts
// ModularApi — main orchestrator.
// Mirror of ModularApi in Dart.
// ============================================================

import express, {
  type Express,
  type RequestHandler,
  type Router,
} from 'express';
import { ModuleBuilder } from './module_builder';
import { buildOpenApiSpec } from '../openapi/openapi';
import swaggerUi from 'swagger-ui-express';
import type { HealthCheck } from './health/health_check';
import { HealthService } from './health/health_service';
import { healthHandler } from './health/health_handler';

export interface ModularApiOptions {
  /** Base path prefix for all module routes. Default: '/api' */
  basePath?: string;
  /** API title shown in Swagger UI. Default: 'API' */
  title?: string;
  /** API version string (e.g. '1.0.0'). Used in health check response. Default: '0.0.0' */
  version?: string;
  /**
   * Release identifier. Defaults to `version-debug`.
   * Override via `process.env.RELEASE_ID`.
   */
  releaseId?: string;
}

/**
 * Main entry point for modular_api.
 *
 * Dart equivalent:
 * ```dart
 * final api = ModularApi(basePath: '/api');
 * api.module('greetings', (m) => m.usecase('hello', SayHello.fromJson));
 * await api.serve(port: 8080);
 * ```
 *
 * TypeScript equivalent:
 * ```ts
 * const api = new ModularApi({ basePath: '/api' });
 * api.module('greetings', (m) => m.usecase('hello', SayHello.fromJson));
 * await api.serve({ port: 8080 });
 * ```
 *
 * Auto-mounted endpoints:
 *   GET /health  → 200/503 application/health+json (IETF draft)
 *   GET /docs    → Swagger UI
 */
export class ModularApi {
  private readonly app: Express;
  private readonly rootRouter: Router;
  private readonly basePath: string;
  private readonly title: string;
  private readonly middlewares: RequestHandler[] = [];
  private readonly healthService: HealthService;

  constructor(options: ModularApiOptions = {}) {
    this.basePath = options.basePath ?? '/api';
    this.title = options.title ?? 'Modular API';

    this.healthService = new HealthService({
      version: options.version ?? 'x.y.z',
      releaseId: options.releaseId,
    });

    this.app = express();
    this.app.use(express.json());

    this.rootRouter = express.Router();
    this.app.use(this.rootRouter);
  }

  /**
   * Register a {@link HealthCheck} to be evaluated on `GET /health`.
   * Returns `this` for method chaining.
   *
   * ```ts
   * api.addHealthCheck(new DatabaseHealthCheck());
   * ```
   */
  addHealthCheck(check: HealthCheck): this {
    this.healthService.addHealthCheck(check);
    return this;
  }

  /**
   * Registers a group of use cases under a named module.
   * Returns `this` for method chaining.
   *
   * ```ts
   * api
   *   .module('users', (m) => {
   *     m.usecase('create', CreateUser.fromJson);
   *     m.usecase('list',   ListUsers.fromJson, { method: 'GET' });
   *   })
   *   .module('products', buildProductsModule);
   * ```
   */
  module(name: string, build: (m: ModuleBuilder) => void): this {
    const builder = new ModuleBuilder(this.basePath, name, this.rootRouter);
    build(builder);
    builder._mount();
    return this;
  }

  /**
   * Adds an Express middleware to the pipeline.
   * Applied in the order they are registered, before any module handler.
   * Returns `this` for method chaining.
   *
   * ```ts
   * api.use(cors()).use(myAuthMiddleware);
   * ```
   */
  use(middleware: RequestHandler): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Starts the Express server on the given port.
   *
   * Auto-mounts:
   *   GET /health → 200 "ok"
   *   GET /docs   → Swagger UI (built from registered use cases)
   *
   * @returns The Node.js http.Server instance
   */
  serve(options: { port: number; host?: string }): Promise<import('http').Server> {
    const { port, host = '0.0.0.0' } = options;

    return new Promise((resolve) => {
      // Register middlewares before routes
      for (const mw of this.middlewares) {
        this.app.use(mw);
      }

      // Health endpoint — IETF Health Check Response Format
      this.app.get('/health', healthHandler(this.healthService));

      // Swagger / OpenAPI docs
      const spec = buildOpenApiSpec({ title: this.title, port });
      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));

      const server = this.app.listen(port, host, () => {
        console.log(`Docs  → http://localhost:${port}/docs`);
        console.log(`Health → http://localhost:${port}/health`);
        resolve(server);
      });
    });
  }
}
