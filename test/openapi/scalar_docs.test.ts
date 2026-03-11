/**
 * Tests for the Scalar API Reference handler at GET /docs.
 *
 * PRD-002 assertions:
 *   1. GET /docs returns HTTP 200.
 *   2. Content-Type header is text/html; charset=utf-8.
 *   3. Response body contains data-url="/openapi.json".
 *   4. Response body contains @scalar/api-reference.
 */

import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import type { Server } from 'http';
import { ModularApi } from '../../src';
import { apiRegistry } from '../../src/core/registry';

describe('GET /docs — Scalar API Reference (PRD-002)', () => {
  let server: Server;

  afterEach(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    apiRegistry.clear();
  });

  async function startServer(title = 'Test API'): Promise<Server> {
    const api = new ModularApi({ title });
    server = await api.serve({ port: 0 });
    return server;
  }

  it('returns HTTP 200', async () => {
    await startServer();
    const res = await request(server).get('/docs');
    expect(res.status).toBe(200);
  });

  it('returns Content-Type text/html', async () => {
    await startServer();
    const res = await request(server).get('/docs');
    expect(res.headers['content-type']).toContain('text/html');
  });

  it('body contains data-url="/openapi.json"', async () => {
    await startServer();
    const res = await request(server).get('/docs');
    expect(res.text).toContain('data-url="/openapi.json"');
  });

  it('body contains @scalar/api-reference CDN script', async () => {
    await startServer();
    const res = await request(server).get('/docs');
    expect(res.text).toContain('@scalar/api-reference');
  });

  it('interpolates the API title in the HTML', async () => {
    await startServer('Pet Store');
    const res = await request(server).get('/docs');
    expect(res.text).toContain('Pet Store');
  });

  it('returns a complete HTML document', async () => {
    await startServer();
    const res = await request(server).get('/docs');
    expect(res.text).toContain('<!DOCTYPE html>');
    expect(res.text).toContain('</html>');
  });
});
