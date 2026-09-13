/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */
import i18n from 'i18n'
import cors from 'cors'
import fs from 'node:fs'
import yaml from 'js-yaml'
import config from 'config'
import morgan from 'morgan'
import multer from 'multer'
import helmet from 'helmet'
import http from 'node:http'
import path from 'node:path'
import express from 'express'
import colors from 'colors/safe'
import serveIndex from 'serve-index'
import bodyParser from 'body-parser'
// @ts-expect-error FIXME due to non-existing type definitions for finale-rest
import * as finale from 'finale-rest'
import compression from 'compression'
// @ts-expect-error FIXME due to non-existing type definitions for express-robots-txt
import robots from 'express-robots-txt'
import cookieParser from 'cookie-parser'
import * as Prometheus from 'prom-client'
import swaggerUi from 'swagger-ui-express'
import featurePolicy from 'feature-policy'
import { IpFilter } from 'express-ipfilter'
// @ts-expect-error FIXME due to non-existing type definitions for express-security.txt
import securityTxt from 'express-security.txt'
import { rateLimit } from 'express-rate-limit'
import { getStream } from 'file-stream-rotator'
import type { Request, Response, NextFunction } from 'express'

import { sequelize, createSequelize, initModels, setSequelize } from './models'
import { UserModel } from './models/user'
import { CardModel } from './models/card'
import { HintModel } from './models/hint'
import { WalletModel } from './models/wallet'
import { ProductModel } from './models/product'
import { RecycleModel } from './models/recycle'
import { AddressModel } from './models/address'
import { QuantityModel } from './models/quantity'
import { FeedbackModel } from './models/feedback'
import { ComplaintModel } from './models/complaint'
import { ChallengeModel } from './models/challenge'
import { ChallengeDependencyModel } from './models/challengeDependency'
import { BasketItemModel } from './models/basketitem'
import { SecurityAnswerModel } from './models/securityAnswer'
import { PrivacyRequestModel } from './models/privacyRequests'
import { SecurityQuestionModel } from './models/securityQuestion'

import logger from './lib/logger'
import { errorPage } from './lib/errorPage'
import * as utils from './lib/utils'
import * as antiCheat from './lib/antiCheat'
import * as security from './lib/insecurity'
import validateConfig from './lib/startup/validateConfig'
import cleanupFtpFolder from './lib/startup/cleanupFtpFolder'
import customizeEasterEgg from './lib/startup/customizeEasterEgg' // vuln-code-snippet hide-line
import customizeApplication from './lib/startup/customizeApplication'
import validatePreconditions, { preconditionsReady } from './lib/startup/validatePreconditions'
import registerWebsocketEvents from './lib/startup/registerWebsocketEvents'
import restoreOverwrittenFilesWithOriginals from './lib/startup/restoreOverwrittenFilesWithOriginals'

import datacreator from './data/datacreator'
import locales from './data/static/locales.json'

import { login } from './routes/login'
import * as verify from './routes/verify'
import * as address from './routes/address'
import * as metrics from './routes/metrics'
import * as payment from './routes/payment'
import { placeOrder } from './routes/order'
import { b2bOrder } from './routes/b2bOrder'
import * as delivery from './routes/delivery'
import * as recycles from './routes/recycles'
import * as twoFactorAuth from './routes/2fa'
import { applyCoupon } from './routes/coupon'
import dataErasure from './routes/dataErasure'
import { dataExport } from './routes/dataExport'
import { chat } from './routes/chat'
import { retrieveBasket } from './routes/basket'
import { searchProducts } from './routes/search'
import { trackOrder } from './routes/trackOrder'
import { saveLoginIp } from './routes/saveLoginIp'
import { serveKeyFiles } from './routes/keyServer'
import * as basketItems from './routes/basketItems'
import { performRedirect } from './routes/redirect'
import { serveEasterEgg } from './routes/easterEgg'
import { getLanguageList } from './routes/languages'
import { getUserProfile } from './routes/userProfile'
import { serveAngularClient } from './routes/angular'
import { resetPassword } from './routes/resetPassword'
import { serveLogFiles } from './routes/logfileServer'
import { servePublicFiles } from './routes/fileServer'
import { addMemory, getMemories } from './routes/memory'
import { changePassword } from './routes/changePassword'
import { regionNames } from './routes/regionNames'
import { retrieveAppVersion } from './routes/appVersion'
import { captchas, verifyCaptcha } from './routes/captcha'
import * as restoreProgress from './routes/restoreProgress'
import { checkKeys, nftUnlocked } from './routes/checkKeys'
import { retrieveLoggedInUser } from './routes/currentUser'
import authenticatedUsers from './routes/authenticatedUsers'
import { securityQuestion } from './routes/securityQuestion'
import { servePremiumContent } from './routes/premiumReward'
import { contractExploitListener } from './routes/web3Wallet'
import { updateUserProfile } from './routes/updateUserProfile'
import { getVideo, promotionVideo } from './routes/videoHandler'
import { likeProductReviews } from './routes/likeProductReviews'
import { repeatNotification } from './routes/repeatNotification'
import { serveQuarantineFiles } from './routes/quarantineServer'
import { showProductReviews } from './routes/showProductReviews'
import { nftMintListener, walletNFTVerify } from './routes/nftMint'
import { createProductReviews } from './routes/createProductReviews'
import { getWalletBalance, addWalletBalance } from './routes/wallet'
import { retrieveAppConfiguration } from './routes/appConfiguration'
import { updateProductReviews } from './routes/updateProductReviews'
import { servePrivacyPolicyProof } from './routes/privacyPolicyProof'
import { profileImageUrlUpload } from './routes/profileImageUrlUpload'
import { profileImageFileUpload } from './routes/profileImageFileUpload'
import { imageCaptchas, verifyImageCaptcha } from './routes/imageCaptcha'
import { upgradeToDeluxe, deluxeMembershipStatus } from './routes/deluxe'
import { orderHistory, allOrders, toggleDeliveryStatus } from './routes/orderHistory'
import { continueCode, continueCodeFindIt, continueCodeFixIt } from './routes/continueCode'
import { ensureFileIsPassed, handleZipFileUpload, checkUploadSize, checkFileType, handleXmlUpload, handleYamlUpload } from './routes/fileUpload'

const app = express()
const server = new http.Server(app)

const startTime = Date.now()

const swaggerDocument = yaml.load(fs.readFileSync('./swagger.yml', 'utf8'))

const appName = config.get<string>('application.metricsNamespace')
const startupGauge = new Prometheus.Gauge({
  name: `${appName}_startup_duration_seconds`,
  help: `Duration ${appName} required to perform a certain task during startup`,
  labelNames: ['task']
})

// Wraps the function and measures its (async) execution time
const collectDurationPromise = (name: string, func: (...args: any) => Promise<any>) => {
  return async (...args: any) => {
    const end = startupGauge.startTimer({ task: name })
    try {
      const res = await func(...args)
      end()
      return res
    } catch (err) {
      console.error('Error in timed startup function: ' + name, err)
      throw err
    }
  }
}

/* Sets view engine to hbs */
app.set('view engine', 'hbs')

void collectDurationPromise('validatePreconditions', validatePreconditions)()
void collectDurationPromise('cleanupFtpFolder', cleanupFtpFolder)()
void collectDurationPromise('validateConfig', validateConfig)({})

function configureApp (app: ReturnType<typeof express>, seq: typeof sequelize) {
  /* Locals */
  app.locals.captchaId = 0
  app.locals.captchaReqId = 1
  app.locals.captchaBypassReqTimes = []
  app.locals.abused_ssti_bug = false
  app.locals.abused_ssrf_bug = false

  /* Compression for all requests */
  app.use(compression())

  /* Bludgeon solution for possible CORS problems: Allow everything! */
  app.options('*', cors())
  app.use(cors())

  /* Security middleware */
  app.use(helmet.noSniff())
  app.use(helmet.frameguard())
  // app.use(helmet.xssFilter()); // = no protection from persisted XSS via RESTful API
  app.disable('x-powered-by')
  app.use(featurePolicy({
    features: {
      payment: ["'self'"]
    }
  }))

  /* Hiring header */
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.append('X-Recruiting', config.get('application.securityTxt.hiring'))
    next()
  })

  /* Remove duplicate slashes from URL which allowed bypassing subsequent filters */
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.url = req.url.replace(/[/]+/g, '/')
    next()
  })

  /* Increase request counter metric for every request */
  app.use(metrics.observeRequestMetricsMiddleware())

  /* Security Policy */
  const securityTxtExpiration = new Date()
  securityTxtExpiration.setFullYear(securityTxtExpiration.getFullYear() + 1)
  app.get(['/.well-known/security.txt', '/security.txt'], verify.accessControlChallenges())
  app.use(['/.well-known/security.txt', '/security.txt'], securityTxt({
    contact: config.get('application.securityTxt.contact'),
    encryption: config.get('application.securityTxt.encryption'),
    acknowledgements: config.get('application.securityTxt.acknowledgements'),
    'Preferred-Languages': [...new Set(locales.map((locale: { key: string }) => locale.key.substr(0, 2)))].join(', '),
    hiring: config.get('application.securityTxt.hiring'),
    csaf: config.get<string>('server.baseUrl') + config.get<string>('application.securityTxt.csaf'),
    expires: securityTxtExpiration.toUTCString()
  }))

  /* robots.txt */
  app.use(robots({ UserAgent: '*', Disallow: '/archive' }))

  /* Check for any URLs having been called that would be expected for challenge solving without cheating */
  app.use(antiCheat.checkForPreSolveInteractions())

  /* Checks for challenges solved by retrieving a file implicitly or explicitly */
  app.use('/assets/public/images/padding', verify.accessControlChallenges())
  app.use('/assets/public/images/products', verify.accessControlChallenges())
  app.use('/assets/public/images/uploads', verify.accessControlChallenges())
  app.use('/assets/i18n', verify.accessControlChallenges())

  /* Checks for challenges solved by abusing SSTi and SSRF bugs */
  app.use('/internal/progress-check', verify.serverSideChallenges())

  /* Create middleware to change paths from the serve-index plugin from absolute to relative */
  const serveIndexMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const origEnd = res.end
    // @ts-expect-error FIXME assignment broken due to seemingly void return value
    res.end = function () {
      if (arguments.length && typeof arguments[0] === 'string') {
        const reqPath = req.originalUrl.replace(/\?.*$/, '')

        const currentFolder = reqPath.split('/').pop()!
        arguments[0] = arguments[0].replace(/a href="([^"]+?)"/gi, function (matchString: string, matchedUrl: string) {
          let relativePath = path.relative(reqPath, matchedUrl)
          if (relativePath === '') {
            relativePath = currentFolder
          } else if (!relativePath.startsWith('.') && currentFolder !== '') {
            relativePath = currentFolder + '/' + relativePath
          } else {
            relativePath = relativePath.replace('..', '.')
          }
          return 'a href="' + relativePath + '"'
        })
      }
      // @ts-expect-error FIXME passed argument has wrong type
      origEnd.apply(this, arguments)
    }
    next()
  }

  /* /infrastructure directory browsing */
  app.use('/infrastructure', serveIndexMiddleware, serveIndex('infrastructure', { icons: true, view: 'details', filter: (filename) => filename !== 'README.md' }))
  app.use('/infrastructure', verify.accessControlChallenges())
  app.use('/infrastructure', (req: Request, res: Response, next: NextFunction) => {
    const filePath = path.resolve('infrastructure', path.normalize(req.path).replace(/^[\\/]+/, ''))
    if (!filePath.startsWith(path.resolve('infrastructure')) || filePath.endsWith('README.md')) {
      return res.status(403).end()
    }
    if (filePath.endsWith('.tf') || filePath.endsWith('.yml') || filePath.endsWith('Dockerfile')) {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return next()
        const cleaned = data.split('\n').filter(line => !line.trim().match(/^#\s*vuln-code-snippet\s/)).map(line => line.replace(/\s*#\s*vuln-code-snippet\s.*$/, '')).join('\n')
        res.type('text/plain').send(cleaned)
      })
    } else {
      express.static('infrastructure')(req, res, next)
    }
  })

  // vuln-code-snippet start directoryListingChallenge accessLogDisclosureChallenge
  /* /ftp directory browsing and file download */ // vuln-code-snippet neutral-line directoryListingChallenge
  app.use('/archive', serveIndexMiddleware, serveIndex('ftp', { icons: true })) // vuln-code-snippet vuln-line directoryListingChallenge
  app.use('/archive(?!/quarantine)/:file', servePublicFiles()) // vuln-code-snippet vuln-line directoryListingChallenge
  app.use('/archive/quarantine/:file', serveQuarantineFiles()) // vuln-code-snippet neutral-line directoryListingChallenge

  app.use('/.well-known', serveIndexMiddleware, serveIndex('.well-known', { icons: true, view: 'details' }))
  app.use('/.well-known', express.static('.well-known'))

  /* /encryptionkeys directory browsing */
  app.use('/secure/keys', serveIndexMiddleware, serveIndex('encryptionkeys', { icons: true, view: 'details' }))
  app.use('/secure/keys/:file', serveKeyFiles())

  /* /logs directory browsing */ // vuln-code-snippet neutral-line accessLogDisclosureChallenge
  app.use('/help/logs', serveIndexMiddleware, serveIndex('logs', { icons: true, view: 'details' })) // vuln-code-snippet vuln-line accessLogDisclosureChallenge
  app.use('/help/logs', verify.accessControlChallenges()) // vuln-code-snippet hide-line
  app.use('/help/logs/:file', serveLogFiles()) // vuln-code-snippet vuln-line accessLogDisclosureChallenge

  /* Swagger documentation for B2B v2 endpoints */
  app.use('/enterprise/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(express.static(path.resolve('frontend/dist/frontend')))
  app.use(cookieParser('kekse'))
  // vuln-code-snippet end directoryListingChallenge accessLogDisclosureChallenge

  /* Serve vendor dependencies locally instead of from CDN */
  app.use('/vendor/beercss', express.static(path.resolve('node_modules/beercss/dist/cdn')))
  app.use('/vendor/material-icons', express.static(path.resolve('node_modules/material-icons/iconfont')))
  app.use('/vendor/fontsource-roboto', express.static(path.resolve('node_modules/@fontsource/roboto')))

  /* Configure and enable backend-side i18n */
  i18n.configure({
    locales: locales.map((locale: { key: string }) => locale.key),
    directory: path.resolve('i18n'),
    cookie: 'language',
    defaultLocale: 'en',
    autoReload: process.env.NODE_ENV !== 'test'
  })
  app.use(i18n.init)

  app.use(bodyParser.urlencoded({ extended: true }))
  /* File Upload */
  app.post('/upload/complaint-file', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), checkUploadSize, checkFileType, handleZipFileUpload, handleXmlUpload, handleYamlUpload)
  app.post('/profile/image/file', uploadToMemory.single('file'), ensureFileIsPassed, metrics.observeFileUploadMetricsMiddleware(), utils.asyncHandler(profileImageFileUpload()))
  app.post('/profile/image/url', uploadToMemory.single('file'), utils.asyncHandler(profileImageUrlUpload()))
  app.post('/shop/photo-wall', uploadToDisk.single('image'), ensureFileIsPassed, security.appendUserId(), metrics.observeFileUploadMetricsMiddleware(), utils.asyncHandler(addMemory()))

  app.use(bodyParser.text({ type: '*/*' }))
  app.use(function jsonParser (req: Request, res: Response, next: NextFunction) {
    // @ts-expect-error FIXME intentionally saving original request in this property
    req.rawBody = req.body
    if (req.headers['content-type']?.includes('application/json')) {
      if (!req.body) {
        req.body = {}
      }
      if (req.body !== Object(req.body)) { // Expensive workaround for 500 errors during Frisby test run (see #640)
        req.body = JSON.parse(req.body)
      }
    }
    next()
  })

  /* HTTP request logging */
  const accessLogStream = getStream({
    filename: path.resolve('logs/access.log.%DATE%'),
    date_format: 'YYYY-MM-DD',
    audit_file: 'logs/audit.json',
    frequency: 'daily',
    verbose: false,
    max_logs: '2d'
  })
  app.use(morgan('combined', { stream: accessLogStream }))

  // vuln-code-snippet start resetPasswordMortyChallenge
  /* Rate limiting */
  app.enable('trust proxy')
  app.use('/shop/auth/reset-password', rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    keyGenerator ({ headers, ip }: { headers: any, ip: any }) { return headers['X-Forwarded-For'] ?? ip } // vuln-code-snippet vuln-line resetPasswordMortyChallenge
  }))
  // vuln-code-snippet end resetPasswordMortyChallenge

  // vuln-code-snippet start changeProductChallenge
  /** Authorization **/
  /* Checks on JWT in Authorization header */ // vuln-code-snippet hide-line
  app.use(verify.jwtChallenges()) // vuln-code-snippet hide-line
  app.use(security.updateAuthenticatedUsers()) // vuln-code-snippet hide-line
  /* Baskets: Unauthorized users are not allowed to access baskets */
  app.use('/shop/cart', security.isAuthorized(), security.appendUserId())
  /* BasketItems: API only accessible for authenticated users */
  app.use('/api/cart-items', security.isAuthorized())
  app.use('/api/cart-items/:id', security.isAuthorized())
  /* Feedbacks: GET allowed for feedback carousel, POST allowed in order to provide feedback without being logged in */
  app.use('/api/feedback/:id', security.isAuthorized())
  /* Users: Only POST is allowed in order to register a new user */
  app.get('/api/accounts', security.isAuthorized())
  app.route('/api/accounts/:id')
    .get(security.isAuthorized())
    .put(security.denyAll())
    .delete(security.denyAll())
  /* Products: Only GET is allowed in order to view products */ // vuln-code-snippet neutral-line changeProductChallenge
  app.post('/api/items', security.isAuthorized()) // vuln-code-snippet neutral-line changeProductChallenge
  // app.put('/api/items/:id', security.isAuthorized()) // vuln-code-snippet vuln-line changeProductChallenge
  app.delete('/api/items/:id', security.denyAll())
  /* Challenges: GET list of challenges allowed. Everything else forbidden entirely */
  app.post('/api/objectives', security.denyAll())
  app.use('/api/objectives/:id', security.denyAll())
  /* Hints: GET and PUT hints allowed. Everything else forbidden */
  app.post('/api/tips', security.denyAll())
  app.route('/api/tips/:id')
    .get(security.denyAll())
    .delete(security.denyAll())
  /* Complaints: POST and GET allowed when logged in only */
  app.get('/api/complaints', security.isAuthorized())
  app.post('/api/complaints', security.isAuthorized())
  app.use('/api/complaints/:id', security.denyAll())
  /* Recycles: POST and GET allowed when logged in only */
  app.get('/api/returns', recycles.blockRecycleItems())
  app.post('/api/returns', security.isAuthorized())
  /* Challenge evaluation before finale takes over */
  app.get('/api/returns/:id', recycles.getRecycleItem())
  app.put('/api/returns/:id', security.denyAll())
  app.delete('/api/returns/:id', security.denyAll())
  /* SecurityQuestions: Only GET list of questions allowed. */
  app.post('/api/recovery-questions', security.denyAll())
  app.use('/api/recovery-questions/:id', security.denyAll())
  /* SecurityAnswers: Only POST of answer allowed. */
  app.get('/api/recovery-answers', security.denyAll())
  app.use('/api/recovery-answers/:id', security.denyAll())
  /* REST API */
  app.use('/shop/auth/details', security.isAuthorized())
  app.use('/shop/cart/:id', security.isAuthorized())
  app.use('/shop/cart/:id/confirmation', security.isAuthorized())
  /* Challenge evaluation before finale takes over */ // vuln-code-snippet hide-start
  app.post('/api/feedback', verify.forgedFeedbackChallenge())
  /* Captcha verification before finale takes over */
  app.post('/api/feedback', utils.asyncHandler(verifyCaptcha()))
  /* Captcha Bypass challenge verification */
  app.post('/api/feedback', verify.captchaBypassChallenge())
  /* User registration challenge verifications before finale takes over */
  app.post('/api/accounts', (req: Request, res: Response, next: NextFunction) => {
    if (req.body.email !== undefined && req.body.password !== undefined && req.body.passwordRepeat !== undefined) {
      if (req.body.email.length !== 0 && req.body.password.length !== 0) {
        req.body.email = req.body.email.trim()
        req.body.password = req.body.password.trim()
        req.body.passwordRepeat = req.body.passwordRepeat.trim()
      } else {
        res.status(400).send(res.__('Invalid email/password cannot be empty'))
      }
    }
    next()
  })
  app.post('/api/accounts', verify.registerAdminChallenge())
  app.post('/api/accounts', verify.passwordRepeatChallenge()) // vuln-code-snippet hide-end
  app.post('/api/accounts', verify.emptyUserRegistration())
  /* Unauthorized users are not allowed to access B2B API */
  app.use('/enterprise/v1', security.isAuthorized())
  /* Check if the quantity is available in stock and limit per user not exceeded, then add item to basket */
  app.put('/api/cart-items/:id', security.appendUserId(), utils.asyncHandler(basketItems.quantityCheckBeforeBasketItemUpdate()))
  app.post('/api/cart-items', security.appendUserId(), utils.asyncHandler(basketItems.quantityCheckBeforeBasketItemAddition()), utils.asyncHandler(basketItems.addBasketItem()))
  /* Accounting users are allowed to check and update quantities */
  app.delete('/api/quantities/:id', security.denyAll())
  app.post('/api/quantities', security.denyAll())
  app.use('/api/quantities/:id', security.isAccounting(), IpFilter(['123.456.789'], { mode: 'allow' }))
  /* Feedbacks: Do not allow changes of existing feedback */
  app.put('/api/feedback/:id', security.denyAll())
  /* PrivacyRequests: Only allowed for authenticated users */
  app.use('/api/data-requests', security.isAuthorized())
  app.use('/api/data-requests/:id', security.isAuthorized())
  /* PaymentMethodRequests: Only allowed for authenticated users */
  app.post('/api/payment-methods', security.appendUserId())
  app.get('/api/payment-methods', security.appendUserId(), utils.asyncHandler(payment.getPaymentMethods()))
  app.put('/api/payment-methods/:id', security.denyAll())
  app.delete('/api/payment-methods/:id', security.appendUserId(), utils.asyncHandler(payment.delPaymentMethodById()))
  app.get('/api/payment-methods/:id', security.appendUserId(), utils.asyncHandler(payment.getPaymentMethodById()))
  /* PrivacyRequests: Only POST allowed for authenticated users */
  app.post('/api/data-requests', security.isAuthorized())
  app.get('/api/data-requests', security.denyAll())
  app.use('/api/data-requests/:id', security.denyAll())

  app.post('/api/addresses', security.appendUserId())
  app.get('/api/addresses', security.appendUserId(), utils.asyncHandler(address.getAddress()))
  app.put('/api/addresses/:id', security.appendUserId())
  app.delete('/api/addresses/:id', security.appendUserId(), utils.asyncHandler(address.delAddressById()))
  app.get('/api/addresses/:id', security.appendUserId(), utils.asyncHandler(address.getAddressById()))
  app.get('/api/deliveries', utils.asyncHandler(delivery.getDeliveryMethods()))
  app.get('/api/deliveries/:id', utils.asyncHandler(delivery.getDeliveryMethod()))
  // vuln-code-snippet end changeProductChallenge

  /* Verify the 2FA Token */
  app.post('/shop/mfa/verify',
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    utils.asyncHandler(twoFactorAuth.verify)
  )
  /* Check 2FA Status for the current User */
  app.get('/shop/mfa/status', security.isAuthorized(), utils.asyncHandler(twoFactorAuth.status))
  /* Enable 2FA for the current User */
  app.post('/shop/mfa/setup',
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    security.isAuthorized(),
    utils.asyncHandler(twoFactorAuth.setup)
  )
  /* Disable 2FA Status for the current User */
  app.post('/shop/mfa/disable',
    rateLimit({ windowMs: 5 * 60 * 1000, max: 100, validate: false }),
    security.isAuthorized(),
    utils.asyncHandler(twoFactorAuth.disable)
  )
  /* Verifying DB related challenges can be postponed until the next request for challenges is coming via finale */
  app.use(verify.databaseRelatedChallenges())

  // vuln-code-snippet start registerAdminChallenge
  /* Generated API endpoints */
  finale.initialize({ app, sequelize: seq })

  const autoModels = [
    { name: 'User', path: 'accounts', exclude: ['password', 'totpSecret'], model: UserModel },
    { name: 'Product', path: 'items', exclude: [], model: ProductModel },
    { name: 'Feedback', path: 'feedback', exclude: [], model: FeedbackModel },
    { name: 'BasketItem', path: 'cart-items', exclude: [], model: BasketItemModel },
    { name: 'Challenge', path: 'objectives', exclude: [], model: ChallengeModel, include: [ChallengeDependencyModel] },
    { name: 'Complaint', path: 'complaints', exclude: [], model: ComplaintModel },
    { name: 'Recycle', path: 'returns', exclude: [], model: RecycleModel },
    { name: 'SecurityQuestion', path: 'recovery-questions', exclude: [], model: SecurityQuestionModel },
    { name: 'SecurityAnswer', path: 'recovery-answers', exclude: [], model: SecurityAnswerModel },
    { name: 'Address', path: 'addresses', exclude: [], model: AddressModel },
    { name: 'PrivacyRequest', path: 'data-requests', exclude: [], model: PrivacyRequestModel },
    { name: 'Card', path: 'payment-methods', exclude: [], model: CardModel },
    { name: 'Quantity', path: 'quantities', exclude: [], model: QuantityModel },
    { name: 'Hint', path: 'tips', exclude: [], model: HintModel }
  ]

  for (const { name, path, exclude, model, include } of autoModels) {
    const resource = finale.resource({
      model,
      endpoints: [`/api/${path}`, `/api/${path}/:id`],
      excludeAttributes: exclude,
      pagination: false,
      include
    })

    // create a wallet when a new user is registered using API
    if (name === 'User') { // vuln-code-snippet neutral-line registerAdminChallenge
      resource.create.send.before((req: Request, res: Response, context: { instance: { id: any }, continue: any }) => { // vuln-code-snippet vuln-line registerAdminChallenge
        WalletModel.create({ UserId: context.instance.id }).catch((err: unknown) => {
          console.log(err)
        })
        return context.continue // vuln-code-snippet neutral-line registerAdminChallenge
      }) // vuln-code-snippet neutral-line registerAdminChallenge
    } // vuln-code-snippet neutral-line registerAdminChallenge
    // vuln-code-snippet end registerAdminChallenge

    // translate challenge descriptions on-the-fly
    if (name === 'Challenge') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          let description = context.instance[i].description
          if (description?.includes('<em>(This challenge is <strong>')) {
            const warning = description.substring(description.indexOf(' <em>(This challenge is <strong>'))
            description = description.substring(0, description.indexOf(' <em>(This challenge is <strong>'))
            context.instance[i].description = req.__(description) + req.__(warning)
          } else {
            context.instance[i].description = req.__(description)
          }
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { description: string, hint: string }, continue: any }) => {
        context.instance.description = req.__(context.instance.description)
        return context.continue
      })
    }

    // translate security questions on-the-fly
    if (name === 'SecurityQuestion') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].question = req.__(context.instance[i].question)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { question: string }, continue: any }) => {
        context.instance.question = req.__(context.instance.question)
        return context.continue
      })
    }

    // translate hints on-the-fly
    if (name === 'Hint') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: string | any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].text = req.__(context.instance[i].text)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { text: string }, continue: any }) => {
        context.instance.text = req.__(context.instance.text)
        return context.continue
      })
    }

    // translate product names and descriptions on-the-fly
    if (name === 'Product') {
      resource.list.fetch.after((req: Request, res: Response, context: { instance: any[], continue: any }) => {
        for (let i = 0; i < context.instance.length; i++) {
          context.instance[i].name = req.__(context.instance[i].name)
          context.instance[i].description = req.__(context.instance[i].description)
        }
        return context.continue
      })
      resource.read.send.before((req: Request, res: Response, context: { instance: { name: string, description: string }, continue: any }) => {
        context.instance.name = req.__(context.instance.name)
        context.instance.description = req.__(context.instance.description)
        return context.continue
      })
    }

    // fix the api difference between finale (fka epilogue) and previously used sequlize-restful
    resource.all.send.before((req: Request, res: Response, context: { instance: { status: string, data: any }, continue: any }) => {
      context.instance = {
        status: 'success',
        data: context.instance
      }
      return context.continue
    })
  }

  /* Custom Restful API */
  app.post('/shop/auth/login', login())
  app.get('/shop/auth/change-password', utils.asyncHandler(changePassword()))
  app.post('/shop/auth/reset-password', utils.asyncHandler(resetPassword()))
  app.get('/shop/auth/recovery-question', utils.asyncHandler(securityQuestion()))
  app.get('/shop/auth/session', utils.asyncHandler(retrieveLoggedInUser()))
  app.get('/shop/auth/details', utils.asyncHandler(authenticatedUsers()))
  app.get('/shop/catalog/search', utils.asyncHandler(searchProducts()))
  app.get('/shop/cart/:id', utils.asyncHandler(retrieveBasket()))
  app.post('/shop/cart/:id/checkout', placeOrder())
  app.put('/shop/cart/:id/promo/:promo', utils.asyncHandler(applyCoupon()))
  app.get('/shop/system/version', utils.asyncHandler(retrieveAppVersion()))
  app.get('/shop/system/configuration', utils.asyncHandler(retrieveAppConfiguration()))
  app.get('/shop/system/notification', utils.asyncHandler(repeatNotification()))
  app.get('/shop/progress/token', utils.asyncHandler(continueCode()))
  app.get('/shop/progress/find-it', utils.asyncHandler(continueCodeFindIt()))
  app.get('/shop/progress/fix-it', utils.asyncHandler(continueCodeFixIt()))
  app.put('/shop/progress/find-it/apply/:continueCode', utils.asyncHandler(restoreProgress.restoreProgressFindIt()))
  app.put('/shop/progress/fix-it/apply/:continueCode', utils.asyncHandler(restoreProgress.restoreProgressFixIt()))
  app.put('/shop/progress/token/apply/:continueCode', utils.asyncHandler(restoreProgress.restoreProgress()))
  app.get('/shop/check-code', utils.asyncHandler(captchas()))
  app.get('/shop/check-image', utils.asyncHandler(imageCaptchas()))
  app.get('/shop/tracking/:id', trackOrder())
  app.get('/shop/country-catalog', utils.asyncHandler(regionNames()))
  app.get('/shop/auth/client-ip', utils.asyncHandler(saveLoginIp()))
  app.post('/shop/auth/data-export', security.appendUserId(), utils.asyncHandler(verifyImageCaptcha()))
  app.post('/shop/auth/data-export', security.appendUserId(), utils.asyncHandler(dataExport()))
  app.get('/shop/system/languages', utils.asyncHandler(getLanguageList()))
  app.get('/shop/orders', utils.asyncHandler(orderHistory()))
  app.get('/shop/orders/all', security.isAccounting(), utils.asyncHandler(allOrders()))
  app.put('/shop/orders/:id/delivery-status', security.isAccounting(), utils.asyncHandler(toggleDeliveryStatus()))
  app.get('/shop/credit-balance', security.appendUserId(), utils.asyncHandler(getWalletBalance()))
  app.put('/shop/credit-balance', security.appendUserId(), utils.asyncHandler(addWalletBalance()))
  app.get('/shop/premium-plan', deluxeMembershipStatus())
  app.post('/shop/premium-plan', security.appendUserId(), utils.asyncHandler(upgradeToDeluxe()))
  app.get('/shop/photo-wall', utils.asyncHandler(getMemories()))
  /* NoSQL API endpoints */
  app.get('/shop/catalog/:id/reviews', showProductReviews())
  app.put('/shop/catalog/:id/reviews', utils.asyncHandler(createProductReviews()))
  app.patch('/shop/catalog/reviews', security.isAuthorized(), updateProductReviews())
  app.post('/shop/catalog/reviews', security.isAuthorized(), utils.asyncHandler(likeProductReviews()))

  /* Chat API endpoint */
  app.post('/shop/assistant', utils.asyncHandler(chat()))

  /* Web3 API endpoints */
  app.post('/shop/loyalty/redeem', utils.asyncHandler(checkKeys()))
  app.get('/shop/loyalty/unlocked', nftUnlocked())
  app.get('/shop/loyalty/enroll', utils.asyncHandler(nftMintListener()))
  app.post('/shop/loyalty/verify', walletNFTVerify())
  app.post('/shop/loyalty/register-device', utils.asyncHandler(contractExploitListener()))

  /* B2B Order API */
  app.post('/enterprise/v1/orders', b2bOrder())

  /* File Serving */
  app.get('/site/decor/thank-you-card', serveEasterEgg())
  app.get('/premium/vault-access', servePremiumContent())
  app.get('/legal/liability-statement', servePrivacyPolicyProof())

  /* Route for dataerasure page */
  app.use('/privacy/erase', dataErasure)

  /* Route for redirects */
  app.get('/redirect', performRedirect())

  /* Routes for promotion video page */
  app.get('/promotion', promotionVideo())
  app.get('/video', getVideo())

  /* Routes for profile page */
  app.get('/profile', utils.asyncHandler(getUserProfile()))
  app.post('/profile', utils.asyncHandler(updateUserProfile()))

  /* Route for vulnerable code snippets */
  // Coding challenges retired for this deployment (challenges.codeReviewsEnabled: never)
  // app.get('/snippets/:challenge', utils.asyncHandler(serveCodeSnippet()))
  // app.post('/snippets/verdict', utils.asyncHandler(checkVulnLines()))
  // app.get('/snippets/fixes/:key', utils.asyncHandler(serveCodeFixes()))
  // app.post('/snippets/fixes', utils.asyncHandler(checkCorrectFix()))

  /* Serve metrics before the Angular catch-all so the route is reachable in all environments */
  app.get('/metrics', utils.asyncHandler(metrics.serveMetrics()))

  app.use(utils.asyncHandler(serveAngularClient()))

  /* Error Handling */
  app.use(verify.errorHandlingChallenge())
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) err.stack = err.message // never leak stack traces (paths, deps, layout) to clients
    next(err)
  })
  app.use(errorPage(config.get<string>('application.name')))
}

// Function called first to ensure that all the i18n files are reloaded successfully before other linked operations.
if (process.env.NODE_ENV !== 'test') {
  restoreOverwrittenFilesWithOriginals().then(() => {
    configureApp(app, sequelize)
  }).catch((err) => {
    console.error(err)
  })
}

const uploadToMemory = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200000 } })
const mimeTypeMap: any = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}
const uploadToDisk = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: any, cb: any) => {
      const isValid = mimeTypeMap[file.mimetype]
      let error: Error | null = new Error('Invalid mime type')
      if (isValid) {
        error = null
      }
      cb(error, path.resolve('frontend/dist/frontend/assets/public/images/uploads/'))
    },
    filename: (req: Request, file: any, cb: any) => {
      const name = security.sanitizeFilename(file.originalname)
        .toLowerCase()
        .split(' ')
        .join('-')
      const ext = mimeTypeMap[file.mimetype]
      cb(null, name + '-' + Date.now() + '.' + ext)
    }
  })
})

const expectedModels = ['Address', 'Basket', 'BasketItem', 'Captcha', 'Card', 'Challenge', 'ChallengeDependency', 'Complaint', 'Delivery', 'Feedback', 'ImageCaptcha', 'Memory', 'PrivacyRequestModel', 'Product', 'Quantity', 'Recycle', 'SecurityAnswer', 'SecurityQuestion', 'User', 'Wallet', 'Hint']
while (!expectedModels.every(model => Object.keys(sequelize.models).includes(model))) {
  logger.info(`Entity models ${colors.bold(Object.keys(sequelize.models).length.toString())} of ${colors.bold(expectedModels.length.toString())} are initialized (${colors.yellow('WAITING')})`)
}
logger.info(`Entity models ${colors.bold(Object.keys(sequelize.models).length.toString())} of ${colors.bold(expectedModels.length.toString())} are initialized (${colors.green('SUCCESS')})`)

// vuln-code-snippet start exposedMetricsChallenge
/* Serve metrics */
let metricsUpdateLoop: any
const Metrics = metrics.observeMetrics() // vuln-code-snippet neutral-line exposedMetricsChallenge
app.get('/metrics', utils.asyncHandler(metrics.serveMetrics())) // vuln-code-snippet vuln-line exposedMetricsChallenge

export async function start (readyCallback?: () => void) {
  const datacreatorEnd = startupGauge.startTimer({ task: 'datacreator' })
  await sequelize.sync({ force: true })
  await preconditionsReady
  await datacreator()
  datacreatorEnd()
  const port = process.env.PORT ?? config.get('server.port')
  process.env.BASE_PATH = process.env.BASE_PATH ?? config.get('server.basePath')

  metricsUpdateLoop = Metrics.updateLoop() // vuln-code-snippet neutral-line exposedMetricsChallenge

  server.listen(port, () => {
    logger.info(colors.cyan(`Server listening on port ${colors.bold(`${port}`)}`))
    startupGauge.set({ task: 'ready' }, (Date.now() - startTime) / 1000)
    if (process.env.BASE_PATH !== '') {
      logger.info(colors.cyan(`Server using proxy base path ${colors.bold(`${process.env.BASE_PATH}`)} for redirects`))
    }
    registerWebsocketEvents(server)
    if (readyCallback) {
      readyCallback()
    }
    if (process.env.EXIT_ON_READY === 'true') {
      // used to benchmark startup time
      process.exit(0)
    }
  })

  void collectDurationPromise('customizeApplication', customizeApplication)() // vuln-code-snippet hide-line
  void collectDurationPromise('customizeEasterEgg', customizeEasterEgg)() // vuln-code-snippet hide-line
}

export function close (exitCode: number | undefined) {
  if (server) {
    clearInterval(metricsUpdateLoop)
    server.close()
  }
  if (exitCode !== undefined) {
    process.exit(exitCode)
  }
}
// vuln-code-snippet end exposedMetricsChallenge

export async function createApp (options?: { inMemoryDb?: boolean }) {
  const seq = options?.inMemoryDb ? createSequelize({ inMemory: true }) : sequelize
  if (options?.inMemoryDb) {
    initModels(seq)
    setSequelize(seq)
  }
  Prometheus.register.clear()
  const testApp = express()
  testApp.set('view engine', 'hbs')
  await restoreOverwrittenFilesWithOriginals()
  configureApp(testApp, seq)
  await seq.sync({ force: true })
  await datacreator()
  return { app: testApp, sequelize: seq }
}

// stop server on sigint or sigterm signals
process.on('SIGINT', () => { close(0) })
process.on('SIGTERM', () => { close(0) })
