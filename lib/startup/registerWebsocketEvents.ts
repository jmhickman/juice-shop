/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import { Server } from 'socket.io'
import { notifications, challenges } from '../../data/datacache'
import * as challengeUtils from '../challengeUtils'
import * as security from '../insecurity'

let firstConnectedSocket: any = null

const globalWithSocketIO = global as typeof globalThis & {
  io: Server
}

const registerWebsocketEvents = (server: any) => {
  const io = new Server(server, { cors: { origin: 'http://localhost:4200' } })
  globalWithSocketIO.io = io

  io.on('connection', (socket: any) => {
    if (firstConnectedSocket === null) {
      socket.emit('server started')
      firstConnectedSocket = socket.id
    }

    notifications.forEach((notification: any) => {
      socket.emit('challenge solved', notification)
    })

    socket.on('notification received', (data: any) => {
      const i = notifications.findIndex(({ flag }: any) => flag === data)
      if (i > -1) {
        notifications.splice(i, 1)
      }
    })

    socket.on('verifyLocalXssChallenge', (data: any) => {
      challengeUtils.solveIf(challenges.localXssChallenge, () => { return data?.includes('<iframe src="javascript:alert(`xss`)">') ?? false })
      challengeUtils.solveIf(challenges.xssBonusChallenge, () => { return data?.includes(config.get('scoring.bonusPayload')) ?? false })
    })

    socket.on('verifySvgInjectionChallenge', (data: any) => {
      challengeUtils.solveIf(challenges.svgInjectionChallenge, () => { return data?.match(/.*\.\.\/\.\.\/\.\.[\w/-]*?\/redirect\?to=https?:\/\/cataas.com\/cat.*/) && security.isRedirectAllowed(data) })
    })
  })
}

export default registerWebsocketEvents
