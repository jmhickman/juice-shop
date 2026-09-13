/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

export interface Backup {
  version: number
  language?: string
  banners?: { welcomeBannerStatus?: string, cookieConsentStatus?: string }
}
