/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

// Minimal replacement for the `errorhandler` npm package that used to render
// the stock error page. Renders a plain branded page instead of the upstream
// default stylesheet / stack dump layout.

function escapeHtml (str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function errorPage (appName: string) {
  return (err: any, req: Request, res: Response, next: NextFunction): void => {
    if (req.accepts('html')) {
      const message = escapeHtml(String(err.message ?? err))
      res.status(err.status ?? 500).type('html').send(
        `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">` +
        `<title>${escapeHtml(appName)}</title></head>` +
        `<body style="font-family:sans-serif;margin:4rem auto;max-width:42rem;color:#222">` +
        `<h1>Something went wrong</h1><p>${message}</p>` +
        `</body></html>`)
    } else if (req.accepts('json')) {
      res.status(err.status ?? 500).json({ error: String(err.message ?? err) })
    } else {
      res.status(err.status ?? 500).type('txt').send(String(err.message ?? err))
    }
  }
}
