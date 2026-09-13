/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import path from 'node:path'
import { type Request, type Response, type NextFunction } from 'express'

export function serveAngularClient () {
  return ({ url }: Request, res: Response, next: NextFunction) => {
    if (!url.startsWith('/api') && !url.startsWith('/shop')) {
      res.sendFile(path.resolve('frontend/dist/frontend/index.html'))
    } else {
      next(new Error('Unexpected path: ' + url))
    }
  }
}
