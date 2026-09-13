/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

async function app () {
  const { default: validateDependencies } = await import('./lib/startup/validateDependenciesBasic')
  await validateDependencies()

  const server = await import('./server')
  await server.start()
}

app()
  .catch(err => {
    throw err
  })
