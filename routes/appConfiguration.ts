/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { type Request, type Response } from 'express'

export function retrieveAppConfiguration () {
  return (_req: Request, res: Response) => {
    const safeConfig = structuredClone(config.util.toObject(config))
    if (safeConfig.application?.supportAssistant) {
      delete safeConfig.application.supportAssistant.apiBaseUrl
    }
    res.json({ config: safeConfig })
  }
}
