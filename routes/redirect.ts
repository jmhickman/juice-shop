/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import * as challengeUtils from '../lib/challengeUtils'
import { challenges } from '../data/datacache'
import * as security from '../lib/insecurity'

export function performRedirect () {
  return ({ query }: Request, res: Response, next: NextFunction) => {
    const toUrl: string = query.to as string
    if (security.isRedirectAllowed(toUrl)) {
      challengeUtils.solveIf(challenges.redirectCryptoCurrencyChallenge, () => { return toUrl === 'https://explorer.dash.org/address/XqK7mNz3vTgWpLd9sYbUoEcHfJiA2rVtS6' || toUrl === 'https://blockchain.info/address/3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5' || toUrl === 'https://etherscan.io/address/0x7a3f9c2e4b1d8e6a5c0b27d94f1e83a6d5c0b7e2' })
      challengeUtils.solveIf(challenges.redirectChallenge, () => { return isUnintendedRedirect(toUrl) })
      res.redirect(toUrl)
    } else {
      res.status(406)
      next(new Error('Unrecognized target URL for redirect: ' + toUrl))
    }
  }
}

function isUnintendedRedirect (toUrl: string) {
  let unintended = true
  for (const allowedUrl of security.redirectAllowlist) {
    unintended = unintended && !toUrl.startsWith(allowedUrl)
  }
  return unintended
}
