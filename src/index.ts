// ============================================================
// index.ts  — Public API barrel export
// This is the single entry point users import from:
//   import { ModularApi, UseCase, Input, Output } from 'modular_api'
// ============================================================

// Core abstractions
export { Input, Output, UseCase } from './core/usecase';
export type { UseCaseFactory } from './core/usecase';

// Controlled error responses
export { UseCaseException } from './core/use_case_exception';

// Main orchestrator
export { ModularApi } from './core/modular_api';
export type { ModularApiOptions } from './core/modular_api';

// Module builder (exposed for advanced / manual usage)
export { ModuleBuilder } from './core/module_builder';
export type { UseCaseOptions } from './core/module_builder';

// Test helper — use in unit tests without an HTTP server
export { useCaseTestHandler } from './core/usecase_test_handler';
export type { TestResponse } from './core/usecase_test_handler';

// Middlewares
export { cors } from './middlewares/cors';
export type { CorsOptions } from './middlewares/cors';
