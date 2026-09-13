/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import pjson from '../../package.json'
import config from 'config'
import logger from '../logger'
import path from 'node:path'
import colors from 'colors/safe'
import { access } from 'node:fs/promises'
import process from 'node:process'
import semver from 'semver'
import portscanner from 'portscanner'
import validateDependencies from './validateDependencies'

let resolvePreconditionsReady: () => void
export const preconditionsReady = new Promise<void>((resolve) => {
  resolvePreconditionsReady = resolve
})

const validatePreconditions = async ({ exitOnFailure = true } = {}) => {
  let success = true
  success = checkIfRunningOnSupportedNodeVersion(process.version) && success
  success = checkIfRunningOnSupportedOS(process.platform) && success
  success = checkIfRunningOnSupportedCPU(process.arch) && success

  const asyncResults = await Promise.all([
    validateDependencies(),
    checkIfRequiredFileExists('build/server.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/index.html'),
    checkIfRequiredFileExists('frontend/dist/frontend/styles.css'),
    checkIfRequiredFileExists('frontend/dist/frontend/main.js'),
    checkIfRequiredFileExists('frontend/dist/frontend/polyfills.js'),
    checkIfPortIsAvailable(process.env.PORT ?? config.get<number>('server.port'))
  ])
  const asyncConditions = asyncResults.every(condition => condition)

  resolvePreconditionsReady()

  if ((!success || !asyncConditions) && exitOnFailure) {
    logger.error(colors.red('Exiting due to unsatisfied precondition!'))
    process.exit(1)
  }
  return success
}

export const checkIfRunningOnSupportedNodeVersion = (runningVersion: string) => {
  const supportedVersion = pjson.engines.node
  const effectiveVersionRange = semver.validRange(supportedVersion)
  if (!effectiveVersionRange) {
    logger.warn(`Invalid Node.js version range ${colors.bold(supportedVersion)} in package.json (${colors.red('ERROR')})`)
    return false
  }
  if (!semver.satisfies(runningVersion, effectiveVersionRange)) {
    logger.warn(`Detected Node version ${colors.bold(runningVersion)} is not in the supported version range of ${supportedVersion} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected Node.js version ${colors.bold(runningVersion)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfRunningOnSupportedOS = (runningOS: string) => {
  const supportedOS = pjson.os
  if (!supportedOS.includes(runningOS)) {
    logger.warn(`Detected OS ${colors.bold(runningOS)} is not in the list of supported platforms ${supportedOS.toString()} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected OS ${colors.bold(runningOS)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfRunningOnSupportedCPU = (runningArch: string) => {
  const supportedArch = pjson.cpu
  if (!supportedArch.includes(runningArch)) {
    logger.warn(`Detected CPU ${colors.bold(runningArch)} is not in the list of supported architectures ${supportedArch.toString()} (${colors.red('ERROR')})`)
    return false
  }
  logger.info(`Detected CPU ${colors.bold(runningArch)} (${colors.green('SUCCESS')})`)
  return true
}

export const checkIfPortIsAvailable = async (port: number | string) => {
  const portNumber = parseInt(port.toString())
  return await new Promise((resolve, reject) => {
    portscanner.checkPortStatus(portNumber, function (error: unknown, status: string) {
      if (error) {
        reject(error)
      } else {
        if (status === 'open') {
          logger.warn(`Port ${colors.bold(port.toString())} is in use (${colors.red('ERROR')})`)
          resolve(false)
        } else {
          logger.info(`Port ${colors.bold(port.toString())} is available (${colors.green('SUCCESS')})`)
          resolve(true)
        }
      }
    })
  })
}

export const checkIfRequiredFileExists = async (pathRelativeToProjectRoot: string) => {
  const fileName = path.basename(pathRelativeToProjectRoot)

  return await access(path.resolve(pathRelativeToProjectRoot)).then(() => {
    logger.info(`Required file ${colors.bold(fileName)} is present (${colors.green('SUCCESS')})`)
    return true
  }).catch(() => {
    logger.warn(`Required file ${colors.bold(fileName)} is missing (${colors.red('ERROR')})`)
    return false
  })
}

export default validatePreconditions
