/**
 * Scalar API Reference handler — serves a single-page HTML widget.
 *
 * The HTML loads `@scalar/api-reference` from a CDN and points it at the
 * local `/openapi.json` endpoint.  No server-side dependencies; no npm
 * packages required.
 *
 * Canonical HTML payload defined in PRD-002.
 */

import type { RequestHandler } from 'express';

const SCALAR_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <title>{{title}} — API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference">
    </script>
  </body>
</html>`;

/**
 * Returns an Express handler that serves the Scalar API Reference HTML.
 *
 * Usage:
 * ```ts
 * app.get('/docs', scalarDocsHandler({ title: 'My API' }));
 * ```
 */
export function scalarDocsHandler(options: { title: string }): RequestHandler {
  const html = SCALAR_HTML_TEMPLATE.replace('{{title}}', options.title);

  return (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };
}
