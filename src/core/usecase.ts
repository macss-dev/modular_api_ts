// ============================================================
// core/usecase.ts
// Base classes: Input, Output, UseCase<I, O>
// Mirror of the Dart abstract classes in usecase.dart
// ============================================================

/**
 * Base class for all use case input DTOs.
 * Every concrete Input must implement:
 *  - toJson()   — serializes the data back to a plain object
 *  - toSchema() — returns an OpenAPI-compatible JSON Schema object
 */
export abstract class Input {
  abstract toJson(): Record<string, unknown>;

  /**
   * Returns an OpenAPI-compatible JSON Schema describing this input.
   * Used to auto-generate Swagger documentation.
   *
   * Example:
   * ```ts
   * toSchema() {
   *   return {
   *     type: 'object',
   *     properties: { name: { type: 'string' } },
   *     required: ['name'],
   *   };
   * }
   * ```
   */
  abstract toSchema(): Record<string, unknown>;
}

/**
 * Base class for all use case output DTOs.
 * Every concrete Output must implement:
 *  - toJson()   — serializes the result to a plain object (sent as HTTP body)
 *  - toSchema() — returns an OpenAPI-compatible JSON Schema object
 *
 * Override `statusCode` to return a non-200 HTTP status code.
 */
export abstract class Output {
  abstract toJson(): Record<string, unknown>;
  abstract toSchema(): Record<string, unknown>;

  /**
   * HTTP status code for the response.
   * Override to return 201, 400, 404, etc.
   * Defaults to 200 OK.
   */
  get statusCode(): number {
    return 200;
  }
}

/**
 * Factory function type — the signature every UseCase class must expose
 * as a static method `fromJson`.
 *
 * Dart equivalent:
 *   static MyUseCase fromJson(Map<String, dynamic> json) { ... }
 */
export type UseCaseFactory<I extends Input, O extends Output> = (
  json: Record<string, unknown>
) => UseCase<I, O>;

/**
 * Base class for all use cases.
 *
 * Lifecycle (same as Dart version):
 *   1. fromJson(json)     — build the use case from the HTTP request body
 *   2. validate()         — optional validation; return error string or null
 *   3. execute()          — run business logic, populate this.output
 *   4. output.toJson()    — serialize and return to HTTP client
 *
 * Dart equivalent:
 *   abstract class UseCase<I extends Input, O extends Output>
 *
 * TypeScript usage:
 * ```ts
 * class SayHello extends UseCase<HelloInput, HelloOutput> {
 *   constructor(input: HelloInput) { super(input); }
 *
 *   static fromJson(json: Record<string, unknown>) {
 *     return new SayHello(HelloInput.fromJson(json));
 *   }
 *
 *   validate() { return null; }
 *
 *   async execute() {
 *     this.output = new HelloOutput(`Hello, ${this.input.name}!`);
 *   }
 * }
 * ```
 */
export abstract class UseCase<I extends Input, O extends Output> {
  /** Populated in execute(). Must be set before execute() returns. */
  protected output!: O;

  constructor(protected readonly input: I) {}

  /**
   * Optional synchronous validation.
   * Return a human-readable error string to abort execution with HTTP 400.
   * Return null to proceed.
   *
   * Dart equivalent:  String? validate()
   */
  validate(): string | null {
    return null;
  }

  /**
   * Business logic. Must set `this.output` before returning.
   * Keep this method free of HTTP concerns.
   */
  abstract execute(): Promise<void>;

  /**
   * Serializes the output DTO to a plain object for the HTTP response.
   * Delegates to this.output.toJson().
   */
  toJson(): Record<string, unknown> {
    return this.output.toJson();
  }

  /**
   * Exposes the output DTO so the handler can read statusCode.
   * @internal
   */
  getOutput(): O {
    return this.output;
  }

  /**
   * Exposes the input DTO for OpenAPI schema introspection.
   * @internal
   */
  getInput(): I {
    return this.input;
  }
}
