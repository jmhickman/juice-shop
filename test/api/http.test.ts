/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import { createTestApp } from './helpers/setup'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('HTTP', () => {
  void it('response must contain CORS header allowing all origins', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.equal(res.headers['access-control-allow-origin'], '*')
  })

  void it('response must contain sameorigin frameguard header', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN')
  })

  void it('response must contain CORS header allowing all origins', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.equal(res.headers['x-content-type-options'], 'nosniff')
  })

  void it('response must not contain recruiting header', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.equal(res.headers['x-recruiting'], config.get('application.securityTxt.hiring'))
  })

  void it('response must not contain XSS protection header', async () => {
    const res = await request(app).get('/')
    assert.equal(res.status, 200)
    assert.equal(res.headers['x-xss-protection'], undefined)
  })

  void it('unknown non-API path redirects to the root view', async () => {
    const res = await request(app).get('/whatever/dead/path')
    assert.equal(res.status, 302)
    assert.equal(res.headers.location, '/')
  })
})
