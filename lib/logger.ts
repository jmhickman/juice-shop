/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import * as winston from 'winston'

export default winston.createLogger({
  transports: [
    new winston.transports.Console({ level: process.env.NODE_ENV === 'test' ? 'error' : 'info' })
  ],
  format: winston.format.simple()
})
