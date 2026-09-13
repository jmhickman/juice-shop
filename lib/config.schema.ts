/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { z } from 'zod'

// -- Application sub-schemas --

const ChatBotSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  model: z.string(),
  apiBaseUrl: z.string(),
  maxRetries: z.number().optional(),
  sampleQuestions: z.array(z.string()).optional()
})

const SocialSchema = z.object({
  twitterUrl: z.string(),
  facebookUrl: z.string(),
  slackUrl: z.string(),
  redditUrl: z.string(),
  pressKitUrl: z.string(),
  nftUrl: z.string().nullable(),
  questionnaireUrl: z.string().nullable(),
  blueSkyUrl: z.string().optional(),
  mastodonUrl: z.string().optional()
})

const RecyclePageSchema = z.object({
  topProductImage: z.string(),
  bottomProductImage: z.string()
})

const WelcomeBannerSchema = z.object({
  showOnFirstStart: z.boolean(),
  title: z.string(),
  message: z.string()
})

const CookieConsentSchema = z.object({
  message: z.string(),
  dismissText: z.string(),
  linkText: z.string(),
  linkUrl: z.string()
})

const SecurityTxtSchema = z.object({
  contact: z.string(),
  encryption: z.string(),
  acknowledgements: z.string(),
  hiring: z.string(),
  csaf: z.string()
})

const PromotionSchema = z.object({
  video: z.string(),
  subtitles: z.string()
})

const EasterEggPlanetSchema = z.object({
  name: z.string(),
  overlayMap: z.string()
})

const GoogleOauthSchema = z.object({
  clientId: z.string(),
  authorizedRedirects: z.array(z.object({ uri: z.string(), proxy: z.string().optional() }))
})

// -- Section schemas --

export const ServerSchema = z.object({
  port: z.number(),
  basePath: z.string(),
  baseUrl: z.string()
})

export const ApplicationSchema = z.object({
  domain: z.string(),
  name: z.string(),
  logo: z.string(),
  favicon: z.string(),
  theme: z.enum(['midnight-plum', 'dusk-rose', 'coral-slate', 'orchid-fern', 'sky-harbor', 'lollo-light-green', 'ember-navy', 'moss-field', 'solar-flare']),
  showAppVersion: z.boolean(),
  showPressLinks: z.boolean(),
  dataExportEnabled: z.boolean(),
  fakeCustomerCount: z.number(),
  rewardTokenName: z.string(),
  privacyContactEmail: z.string(),
  metricsNamespace: z.string(),
  supportAssistant: ChatBotSchema,
  social: SocialSchema,
  recyclePage: RecyclePageSchema,
  welcomeBanner: WelcomeBannerSchema,
  cookieConsent: CookieConsentSchema,
  securityTxt: SecurityTxtSchema,
  promotion: PromotionSchema,
  holoDisplay: EasterEggPlanetSchema,
  googleOauth: GoogleOauthSchema
})

export const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string(),
  image: z.string(),
  deluxePrice: z.number().optional(),
  limitPerUser: z.number().optional(),
  reviews: z.array(z.object({ text: z.string(), author: z.string() })).optional(),
  urlForProductTamperingChallenge: z.string().optional(),
  useForChristmasSpecialChallenge: z.boolean().optional(),
  keywordsForPastebinDataLeakChallenge: z.array(z.string()).optional(),
  deletedDate: z.string().optional(),
  quantity: z.number().optional(),
  fileForRetrieveBlueprintChallenge: z.string().optional(),
  exifForBlueprintChallenge: z.array(z.string()).optional()
})

export const MemorySchema = z.object({
  image: z.string(),
  caption: z.string(),
  user: z.string().optional(),
  geoStalkingMetaSecurityQuestion: z.number().optional(),
  geoStalkingMetaSecurityAnswer: z.string().optional(),
  geoStalkingVisualSecurityQuestion: z.number().optional(),
  geoStalkingVisualSecurityAnswer: z.string().optional()
})

export const AppConfigSchema = z.object({
  server: ServerSchema,
  application: ApplicationSchema,
  products: z.array(ProductSchema),
  memories: z.array(MemorySchema),
})

// Recursively drops null-valued object keys and null array elements.
// custom configs use null to signal that a value from the default.yml should be overwritten
const dropNulls = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.filter((entry) => entry != null).map(dropNulls)
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry != null)
        .map(([key, entry]) => [key, dropNulls(entry)])
    )
  }
  return value
}

// Deep-partial schema for validating possibly-incomplete individual YAML config files.
export const ValidationSchema = z.preprocess(dropNulls, z.object({
  server: ServerSchema.partial().optional(),
  application: ApplicationSchema.partial().extend({
    supportAssistant: ChatBotSchema.partial().optional(),
    social: SocialSchema.partial().optional(),
    recyclePage: RecyclePageSchema.partial().optional(),
    welcomeBanner: WelcomeBannerSchema.partial().optional(),
    cookieConsent: CookieConsentSchema.partial().optional(),
    securityTxt: SecurityTxtSchema.partial().optional(),
    promotion: PromotionSchema.partial().optional(),
    holoDisplay: EasterEggPlanetSchema.partial().optional(),
    googleOauth: GoogleOauthSchema.partial().optional()
  }).optional(),
  products: z.array(ProductSchema.partial()).optional(),
  memories: z.array(MemorySchema.partial()).optional(),
}))

export type ServerConfig = z.infer<typeof ServerSchema>
export type ApplicationConfig = z.infer<typeof ApplicationSchema>
export type Product = z.infer<typeof ProductSchema>
export type Memory = z.infer<typeof MemorySchema>
export type AppConfig = z.infer<typeof AppConfigSchema>
