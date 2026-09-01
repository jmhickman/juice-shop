/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { type Challenge } from '@lollo-logistics/data/types'
import { challenges } from '../../data/datacache'
import { servePremiumContent } from '../../routes/premiumReward'

void describe('premiumReward', () => {
  let req: any
  let res: any
  let save: any

  beforeEach(() => {
    res = { sendFile: mock.fn() }
    req = {}
    save = () => ({
      then () { }
    })
  })

  void it('should serve /frontend/dist/frontend/assets/private/lollo_wallpaper_1920x1080_vr.jpg', () => {
    servePremiumContent()(req, res)

    assert.equal(res.sendFile.mock.calls.length, 1)
    assert.match(res.sendFile.mock.calls[0].arguments[0], /frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]lollo_wallpaper_1920x1080_vr\.jpg/)
  })
})
