/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/api', () => {
  void it('GET error when query /api without actual resource', async () => {
    const res = await request(app)
      .get('/api')
    assert.equal(res.status, 500)
  })
})

void describe('/shop', () => {
  void it('GET JSON error when calling unrecognized path under /shop', async () => {
    const res = await request(app)
      .get('/shop/unrecognized')
      .set('Accept', 'application/json')
    assert.equal(res.status, 404)
    assert.equal(res.body.error, 'Not Found')
  })
})
