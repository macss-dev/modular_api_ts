/**
 * Swagger UI docs handler — serves an HTML page with the Swagger UI widget.
 *
 * Loads `swagger-ui-dist@5` from jsdelivr CDN and points it at the local
 * `/openapi.json` endpoint.  No server-side dependencies; no npm packages
 * required.
 *
 * Canonical HTML payload defined in PRD-003.
 */

import type { RequestHandler } from 'express';

const SWAGGER_UI_HTML_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <title>{{title}} — API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js">
    </script>
    <script>
      SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        deepLinking: true
      })
    </script>
  </body>
</html>`;

/**
 * Returns an Express handler that serves the Swagger UI HTML.
 *
 * Usage:
 * ```ts
 * app.get('/docs', swaggerDocsHandler({ title: 'My API' }));
 * ```
 */
export function swaggerDocsHandler(options: { title: string }): RequestHandler {
  const html = SWAGGER_UI_HTML_TEMPLATE.replace('{{title}}', options.title);

  return (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };
}
