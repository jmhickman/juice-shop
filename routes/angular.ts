/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

// Fallback for anything not matched by API endpoints or static files. The SPA
// uses hash-based routing, so every app state lives under "/#/...". Unknown
// paths therefore redirect to the root view instead of serving index.html at
// the bogus URL (which left Angular stranded with URLs like "/foo#/").
export function serveAngularClient () {
  return ({ url }: Request, res: Response, next: NextFunction) => {
    if (url.startsWith('/api') || url.startsWith('/shop')) {
      const err: any = new Error('Not Found')
      err.status = 404
      next(err)
    } else {
      res.redirect('/')
    }
  }
}
