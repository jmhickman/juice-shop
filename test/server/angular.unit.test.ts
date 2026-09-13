/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { serveAngularClient } from '../../routes/angular'

void describe('angular', () => {
  let req: any
  let res: any
  let next: any

  beforeEach(() => {
    req = { }
    res = { redirect: mock.fn() }
    next = mock.fn()
  })

  void it('should redirect unknown URLs to the root view', () => {
    req.url = '/any/thing'

    serveAngularClient()(req, res, next)

    assert.equal(res.redirect.mock.calls.length, 1)
    assert.equal(res.redirect.mock.calls[0].arguments[0], '/')
    assert.equal(next.mock.calls.length, 0)
  })

  void it('should raise 404 error for /api endpoint URL', () => {
    req.url = '/api'

    serveAngularClient()(req, res, next)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(next.mock.calls.length, 1)
    const err = next.mock.calls[0].arguments[0]
    assert.equal((err as any).status, 404)
    assert.ok(err instanceof Error)
  })

  void it('should raise 404 error for /shop endpoint URL', () => {
    req.url = '/shop/bogus'

    serveAngularClient()(req, res, next)

    assert.equal(res.redirect.mock.calls.length, 0)
    assert.equal(next.mock.calls.length, 1)
    const err = next.mock.calls[0].arguments[0]
    assert.equal((err as any).status, 404)
    assert.ok(err instanceof Error)
  })
})
