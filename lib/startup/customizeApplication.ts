/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs'
import config from 'config'
import logger from '../logger'
import * as utils from '../utils'
// @ts-expect-error FIXME due to non-existing type definitions for replace
import replace from 'replace'

const customizeApplication = async () => {
  if (config.get<string>('application.name')) {
    customizeTitle()
    customizeTerraformFiles()
  }
  if (config.get('application.logo')) {
    void customizeLogo()
  }
  if (config.get('application.favicon')) {
    void customizeFavicon()
  }
  if (config.get('application.theme')) {
    customizeTheme()
  }
  if (config.get('application.cookieConsent')) {
    customizeCookieConsentBanner()
  }
  if (config.get('application.promotion')) {
    void customizePromotionVideo()
    void customizePromotionSubtitles()
  }
  if (config.get('application.supportAssistant')) {
    void customizeChatbotAvatar()
  }
}

const customizeLogo = async () => {
  await retrieveCustomFile('application.logo', 'frontend/dist/frontend/assets/public/images')
}

const customizeChatbotAvatar = async () => {
  const avatarImage = await retrieveCustomFile('application.supportAssistant.avatar', 'frontend/dist/frontend/assets/public/images')
  copyAvatar(avatarImage, 'ChatbotAvatar.png')
}


const copyAvatar = (source: string, target: string) => {
  const sourcePath = 'frontend/dist/frontend/assets/public/images/' + source
  if (!fs.existsSync(sourcePath)) {
    logger.warn(`Avatar image ${source} not found, keeping default avatar in place`)
    return
  }
  fs.copyFileSync(sourcePath, 'frontend/dist/frontend/assets/public/images/' + target)
}

const customizeFavicon = async () => {
  const favicon = await retrieveCustomFile('application.favicon', 'frontend/dist/frontend/assets/public')
  replace({
    regex: /type="image\/x-icon" href="assets\/public\/.*"/,
    replacement: `type="image/x-icon" href="assets/public/${favicon}"`,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizePromotionVideo = async () => {
  await retrieveCustomFile('application.promotion.video', 'frontend/dist/frontend/assets/public/videos')
}

const customizePromotionSubtitles = async () => {
  await retrieveCustomFile('application.promotion.subtitles', 'frontend/dist/frontend/assets/public/videos')
}

const retrieveCustomFile = async (sourceProperty: string, destinationFolder: string) => {
  let file = config.get<string>(sourceProperty)
  if (utils.isUrl(file)) {
    const filePath = file
    file = utils.extractFilename(file)
    await utils.downloadToFile(filePath, destinationFolder + '/' + file)
  }
  return file
}

const customizeTitle = () => {
  const title = `<title>${config.get<string>('application.name')}</title>`
  replace({
    regex: /<title>.*<\/title>/,
    replacement: title,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeTheme = () => {
  const bodyClass = '"' + config.get<string>('application.theme') + '-theme"'
  replace({
    regex: /".*-theme"/,
    replacement: bodyClass,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const customizeCookieConsentBanner = () => {
  const contentProperty = '"content": { "message": "' + config.get<string>('application.cookieConsent.message') + '", "dismiss": "' + config.get<string>('application.cookieConsent.dismissText') + '", "link": "' + config.get<string>('application.cookieConsent.linkText') + '", "href": "' + config.get<string>('application.cookieConsent.linkUrl') + '" }'
  replace({
    regex: /"content": { "message": ".*", "dismiss": ".*", "link": ".*", "href": ".*" }/,
    replacement: contentProperty,
    paths: ['frontend/dist/frontend/index.html'],
    recursive: false,
    silent: true
  })
}

const slugify = (name: string) => {
  return name.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
}

const customizeTerraformFiles = () => {
  const appName = config.get<string>('application.name')
  if (appName !== 'Lollo Logistics') {
    const slugName = slugify(appName)
    const snakeName = slugName.replace(/-/g, '_')
    replace({
      regex: /lollo-logistics/g,
      replacement: slugName,
      paths: ['terraform'],
      recursive: true,
      silent: true
    })
    replace({
      regex: /lollo_logistics/g,
      replacement: snakeName,
      paths: ['terraform'],
      recursive: true,
      silent: true
    })
  }
}

export default customizeApplication
