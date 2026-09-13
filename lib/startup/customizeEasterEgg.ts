/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import config from 'config'
import * as utils from '../utils'
// @ts-expect-error FIXME due to non-existing type definitions for replace
import replace from 'replace'

const customizeEasterEgg = async () => {
  if (config.has('application.holoDisplay.overlayMap')) {
    let overlay: string = config.get('application.holoDisplay.overlayMap')
    if (utils.isUrl(overlay)) {
      const overlayPath = overlay
      overlay = utils.extractFilename(overlay)
      await utils.downloadToFile(overlayPath, 'frontend/dist/frontend/assets/private/' + overlay)
    }
    replaceImagePath(overlay)
  }
  if (config.has('application.holoDisplay.name')) {
    replaceThreeJsTitleTag()
  }
}

const replaceImagePath = (overlay: string) => {
  const textureDeclaration = 'planetTexture = THREE.ImageUtils.loadTexture("/assets/private/' + overlay + '");'
  replace({
    regex: /planetTexture = .*;/,
    replacement: textureDeclaration,
    paths: ['frontend/dist/frontend/assets/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

const replaceThreeJsTitleTag = () => {
  const threeJsTitleTag = '<title>Welcome to Planet ' + config.get<string>('application.holoDisplay.name') + '</title>'
  replace({
    regex: /<title>.*<\/title>/,
    replacement: threeJsTitleTag,
    paths: ['frontend/dist/frontend/assets/private/threejs-demo.html'],
    recursive: false,
    silent: true
  })
}

export default customizeEasterEgg
