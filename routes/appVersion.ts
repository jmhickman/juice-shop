/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { type Request, type Response } from 'express'

import * as utils from '../lib/utils'

export function retrieveAppVersion () {
  return (_req: Request, res: Response) => {
    res.json({
      version: config.get('application.showAppVersion') ? utils.version() : ''
    })
  }
}
