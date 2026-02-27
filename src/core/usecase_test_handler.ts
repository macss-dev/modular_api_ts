// ============================================================
// core/usecase_test_handler.ts
// Test helper — runs a UseCase without an HTTP server.
// Mirror of useCaseTestHandler() in Dart.
// ============================================================

import type { UseCaseFactory, Input, Output } from './usecase';
import { UseCaseException } from './use_case_exception';
import type { ModularLogger } from './logger/logger';

export interface TestResponse {
  statusCode: number;
  body: Record<string, unknown>;
}

/**
 * Executes a UseCase directly from a plain JSON object, without Express.
 * Ideal for unit tests — no HTTP server needed.
 *
 * Mirrors the Dart `useCaseTestHandler` pattern.
 *
 * Returns a `TestResponse` with `statusCode` and `body` so you can assert
 * on both the HTTP status and the JSON payload.
 *
 * Usage:
 * ```ts
 * import { useCaseTestHandler } from 'modular_api';
 *
 * const response = await useCaseTestHandler(SayHello.fromJson, { name: 'World' });
 * expect(response.statusCode).toBe(200);
 * expect(response.body).toEqual({ message: 'Hello, World!' });
 * ```
 */
export async function useCaseTestHandler<I extends Input, O extends Output>(
  factory: UseCaseFactory<I, O>,
  input: Record<string, unknown> = {},
  options?: { logger?: ModularLogger },
): Promise<TestResponse> {
  try {
    const useCase = factory(input);

    // Inject logger if provided
    if (options?.logger) {
      useCase.logger = options.logger;
    }

    const validationError = useCase.validate();
    if (validationError !== null) {
      return {
        statusCode: 400,
        body: { error: validationError },
      };
    }

    const output = await useCase.execute();

    return {
      statusCode: output.statusCode,
      body: output.toJson(),
    };
  } catch (err) {
    if (err instanceof UseCaseException) {
      return {
        statusCode: err.statusCode,
        body: err.toJson(),
      };
    }
    return {
      statusCode: 500,
      body: { error: 'Internal server error' },
    };
  }
}
