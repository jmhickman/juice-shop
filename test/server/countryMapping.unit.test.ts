/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import config, { type IConfig } from 'config'
import { regionNames } from '../../routes/regionNames'

void describe('regionNames', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {}
    res = { send: mock.fn(), status: mock.fn(() => ({ send: mock.fn() })) }
  })

  void it('should return configured country mappings', () => {
    regionNames({ get: mock.fn((key: string) => key === 'awards.regionNames' ? 'TEST' : undefined) } as unknown as IConfig)(req, res)

    assert.equal(res.send.mock.calls.length, 1)
    assert.equal(res.send.mock.calls[0].arguments[0], 'TEST')
  })

  void it('should return server error when configuration has no country mappings', () => {
    regionNames({ get: mock.fn((key: string) => key === 'awards.regionNames' ? null : undefined) } as unknown as IConfig)(req, res)

    assert.equal(res.status.mock.calls.length, 1)
    assert.equal(res.status.mock.calls[0].arguments[0], 500)
  })

  void it('should return ' + (config.get('awards.regionNames') ? 'no ' : '') + 'server error for active configuration from config/' + process.env.NODE_ENV + '.yml', () => {
    regionNames()(req, res)

    if (config.get('awards.regionNames')) {
      assert.equal(res.send.mock.calls.length, 1)
      assert.deepEqual(res.send.mock.calls[0].arguments[0], config.get('awards.regionNames'))
    } else {
      assert.equal(res.status.mock.calls.length, 1)
      assert.equal(res.status.mock.calls[0].arguments[0], 500)
    }
  })
})
