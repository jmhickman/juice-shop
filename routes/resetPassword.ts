/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'

import { SecurityAnswerModel } from '../models/securityAnswer'
import * as security from '../lib/insecurity'
import { UserModel } from '../models/user'

export function resetPassword () {
  return async ({ body, connection }: Request, res: Response, next: NextFunction) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat
    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      return
    }
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
      return
    }
    if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
      return
    }
    try {
      const data = await SecurityAnswerModel.findOne({
        include: [{
          model: UserModel,
          where: { email }
        }]
      })
      if ((data != null) && security.hmac(answer) === data.answer) {
        const user = await UserModel.findByPk(data.UserId)
        if (user) {
          const updatedUser = await user.update({ password: newPassword })
          res.json({ user: updatedUser })
        }
      } else {
        res.status(401).send(res.__('Wrong answer to security question.'))
      }
    } catch (error) {
      next(error)
    }
  }
}
