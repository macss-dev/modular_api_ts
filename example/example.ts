/**
 * example/example.ts
 * Minimal runnable example — mirrors example/example.dart from the Dart version.
 *
 * Run:
 *   npx ts-node example/example.ts
 *
 * Then test:
 *   curl -X POST http://localhost:8080/api/greetings/hello \
 *        -H "Content-Type: application/json" \
 *        -d '{"name":"World"}'
 *
 * Docs:
 *   http://localhost:8080/docs
 */

import { Input, Output, UseCase, ModularApi, ModuleBuilder } from '../src/index';

// ─── Module Builder ───────────────────────────────────────────────────────────
// In a real project, this would live in its own file:
//   src/modules/greetings/greetings_builder.ts

function buildGreetingsModule(m: ModuleBuilder): void {
  m.usecase('hello', HelloWorld.fromJson);
}

// ─── Input DTO ────────────────────────────────────────────────────────────────

class HelloInput extends Input {
  constructor(readonly name: string) {
    super();
  }

  static fromJson(json: Record<string, unknown>): HelloInput {
    const name = (json['name'] ?? '').toString();
    return new HelloInput(name);
  }

  toJson() {
    return { name: this.name };
  }

  toSchema() {
    return {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name to greet' },
      },
      required: ['name'],
    };
  }
}

// ─── Output DTO ───────────────────────────────────────────────────────────────

class HelloOutput extends Output {
  constructor(readonly message: string) {
    super();
  }

  toJson() {
    return { message: this.message };
  }

  toSchema() {
    return {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Greeting message' },
      },
      required: ['message'],
    };
  }
}

// ─── UseCase ──────────────────────────────────────────────────────────────────

class HelloWorld extends UseCase<HelloInput, HelloOutput> {
  constructor(input: HelloInput) {
    super(input);
  }

  static fromJson(json: Record<string, unknown>): HelloWorld {
    return new HelloWorld(HelloInput.fromJson(json));
  }

  override validate(): string | null {
    if (!this.input.name) {
      return 'name is required';
    }
    return null;
  }

  async execute(): Promise<void> {
    this.output = new HelloOutput(`Hello, ${this.input.name}!`);
  }
}

// ─── Server ───────────────────────────────────────────────────────────────────

const api = new ModularApi({ basePath: '/api', title: 'Greetings API' });

api.module('greetings', buildGreetingsModule);

api.serve({ port: 8080 }).then(() => {
  console.log('====================================');
  console.log('API  → http://localhost:8080/api/greetings/hello');
  console.log('Docs → http://localhost:8080/docs');
  console.log('Health → http://localhost:8080/health');
  console.log('====================================');
});
