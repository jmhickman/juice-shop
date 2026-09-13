/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { UserModel } from '../models/user'
import { WalletModel } from '../models/wallet'
import { FeedbackModel } from '../models/feedback'
import { ComplaintModel } from '../models/complaint'
import { Op } from 'sequelize'
import logger from '../lib/logger'
import config from 'config'
import * as utils from '../lib/utils'
import { reviewsCollection, ordersCollection } from '../data/mongodb'
import * as Prometheus from 'prom-client'
import onFinished from 'on-finished'

const register = Prometheus.register

let fileUploadsCountMetric = new Prometheus.Counter({
  name: 'file_uploads_count',
  help: 'Total number of successful file uploads grouped by file type.',
  labelNames: ['file_type']
})

let fileUploadErrorsMetric = new Prometheus.Counter({
  name: 'file_upload_errors',
  help: 'Total number of failed file uploads grouped by file type.',
  labelNames: ['file_type']
})

let httpRequestsMetric = new Prometheus.Counter({
  name: 'http_requests_count',
  help: 'Total HTTP request count grouped by status code.',
  labelNames: ['status_code']
})

export function reRegisterMetrics () {
  fileUploadsCountMetric = new Prometheus.Counter({
    name: 'file_uploads_count',
    help: 'Total number of successful file uploads grouped by file type.',
    labelNames: ['file_type']
  })
  fileUploadErrorsMetric = new Prometheus.Counter({
    name: 'file_upload_errors',
    help: 'Total number of failed file uploads grouped by file type.',
    labelNames: ['file_type']
  })
  httpRequestsMetric = new Prometheus.Counter({
    name: 'http_requests_count',
    help: 'Total HTTP request count grouped by status code.',
    labelNames: ['status_code']
  })
}

export function observeRequestMetricsMiddleware () {
  return (req: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      const statusCode = `${Math.floor(res.statusCode / 100)}XX`
      httpRequestsMetric.labels(statusCode).inc()
    })
    next()
  }
}

export function observeFileUploadMetricsMiddleware () {
  return ({ file }: Request, res: Response, next: NextFunction) => {
    onFinished(res, () => {
      if (file != null) {
        res.statusCode < 400 ? fileUploadsCountMetric.labels(file.mimetype).inc() : fileUploadErrorsMetric.labels(file.mimetype).inc()
      }
    })
    next()
  }
}

export function serveMetrics () {
  return async (_req: Request, res: Response) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  }
}

export function observeMetrics () {
  const app = config.get<string>('application.metricsNamespace')
  Prometheus.collectDefaultMetrics({})
  register.setDefaultLabels({ app })

  const versionMetrics = new Prometheus.Gauge({
    name: `${app}_version_info`,
    help: `Release version of ${config.get<string>('application.name')}.`,
    labelNames: ['version', 'major', 'minor', 'patch']
  })

  const orderMetrics = new Prometheus.Gauge({
    name: `${app}_orders_placed_total`,
    help: `Number of orders placed in ${config.get<string>('application.name')}.`
  })

  const userMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered`,
    help: 'Number of registered users grouped by customer type.',
    labelNames: ['type']
  })

  const userTotalMetrics = new Prometheus.Gauge({
    name: `${app}_users_registered_total`,
    help: 'Total number of registered users.'
  })

  const walletMetrics = new Prometheus.Gauge({
    name: `${app}_wallet_balance_total`,
    help: 'Total balance of all users\' digital wallets.'
  })

  const interactionsMetrics = new Prometheus.Gauge({
    name: `${app}_user_social_interactions`,
    help: 'Number of social interactions with users grouped by type.',
    labelNames: ['type']
  })

  const updateLoop = () => setInterval(() => {
    void (async () => {
      try {
        const version = utils.version()
        const { major, minor, patch } = version.match(/(?<major>\d+).(?<minor>\d+).(?<patch>\d+)/).groups
        versionMetrics.set({ version, major, minor, patch }, 1)

        const [orderCount, reviewCount, customerCount, deluxeCount, totalUserCount, totalBalance, feedbackCount, complaintCount] = await Promise.all([
          ordersCollection.count({}),
          reviewsCollection.count({}),
          UserModel.count({ where: { role: { [Op.eq]: 'customer' } } }),
          UserModel.count({ where: { role: { [Op.eq]: 'deluxe' } } }),
          UserModel.count(),
          WalletModel.sum('balance'),
          FeedbackModel.count(),
          ComplaintModel.count()
        ])

        if (orderCount) orderMetrics.set(orderCount)
        if (reviewCount) interactionsMetrics.set({ type: 'review' }, reviewCount)
        if (customerCount) userMetrics.set({ type: 'standard' }, customerCount)
        if (deluxeCount) userMetrics.set({ type: 'deluxe' }, deluxeCount)
        if (totalUserCount) userTotalMetrics.set(totalUserCount)
        if (totalBalance) walletMetrics.set(totalBalance)
        if (feedbackCount) interactionsMetrics.set({ type: 'feedback' }, feedbackCount)
        if (complaintCount) interactionsMetrics.set({ type: 'complaint' }, complaintCount)
      } catch (e: unknown) {
        logger.warn('Error during metrics update loop: + ' + utils.getErrorMessage(e))
      }
    })()
  }, 5000)

  return {
    register,
    updateLoop
  }
}
