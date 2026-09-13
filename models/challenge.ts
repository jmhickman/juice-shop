/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import {
  Model,
  type InferAttributes,
  type InferCreationAttributes,
  DataTypes,
  type CreationOptional,
  type Sequelize
} from 'sequelize'

export const CHALLENGE_KEYS = [
  'passwordHashLeakChallenge',
  'restfulXssChallenge',
  'accessLogDisclosureChallenge',
  'registerAdminChallenge',
  'adminSectionChallenge',
  'fileWriteChallenge',
  'rceChallenge',
  'captchaBypassChallenge',
  'changePasswordBenderChallenge',
  'christmasSpecialChallenge',
  'usernameXssChallenge',
  'persistedXssUserChallenge',
  'directoryListingChallenge',
  'localXssChallenge',
  'dbSchemaChallenge',
  'deprecatedInterfaceChallenge',
  'emailLeakChallenge',
  'emptyUserRegistration',
  'ephemeralAccountantChallenge',
  'errorHandlingChallenge',
  'manipulateClockChallenge',
  'feedbackChallenge',
  'forgedFeedbackChallenge',
  'forgedReviewChallenge',
  'forgottenDevBackupChallenge',
  'forgottenBackupChallenge',
  'typosquattingAngularChallenge',
  'ghostLoginChallenge',
  'dataExportChallenge',
  'httpHeaderXssChallenge',
  'dlpPasswordSprayingChallenge',
  'dlpPastebinDataLeakChallenge',
  'typosquattingNpmChallenge',
  'loginAdminChallenge',
  'loginAmyChallenge',
  'loginBenderChallenge',
  'oauthUserPasswordChallenge',
  'loginJimChallenge',
  'loginRapperChallenge',
  'loginSupportChallenge',
  'basketManipulateChallenge',
  'misplacedSignatureFileChallenge',
  'noSqlCommandChallenge',
  'noSqlOrdersChallenge',
  'noSqlReviewsChallenge',
  'redirectCryptoCurrencyChallenge',
  'weakPasswordChallenge',
  'negativeOrderChallenge',
  'privacyPolicyChallenge',
  'changeProductChallenge',
  'reflectedXssChallenge',
  'passwordRepeatChallenge',
  'retrieveBlueprintChallenge',
  'ssrfChallenge',
  'sstiChallenge',
  'scoreBoardChallenge',
  'securityPolicyChallenge',
  'persistedXssFeedbackChallenge',
  'rceOccupyChallenge',
  'supplyChainAttackChallenge',
  'twoFactorAuthUnsafeSecretStorageChallenge',
  'jwtUnsignedChallenge',
  'uploadSizeChallenge',
  'uploadTypeChallenge',
  'unionSqlInjectionChallenge',
  'basketAccessChallenge',
  'knownVulnerableComponentChallenge',
  'redirectChallenge',
  'xxeFileDisclosureChallenge',
  'xxeDosChallenge',
  'yamlBombChallenge',
  'zeroStarsChallenge',
  'svgInjectionChallenge',
  'exposedMetricsChallenge',
  'misplacedIacFiles',
  'freeDeluxeChallenge',
  'xssBonusChallenge',
  'nullByteChallenge',
  'lfrChallenge',
  'csafChallenge',
  'exposedCredentialsChallenge',
  'leakedApiKeyChallenge',
  'chatbotPromptInjectionChallenge',
  'chatbotGreedyInjectionChallenge',
  'aiDebuggingChallenge',
  'systemPromptExtractionChallenge',
  'iacLeakedKeyChallenge',
  'vulnerableDockerImageChallenge',
] as const

export type ChallengeKey = typeof CHALLENGE_KEYS[number]

class Challenge extends Model<
InferAttributes<Challenge>,
InferCreationAttributes<Challenge>
> {
  declare id: CreationOptional<number>
  declare name: string
  declare category: string
  declare description: string
  declare difficulty: number
  declare mitigationUrl: CreationOptional<string> | null
  declare key: ChallengeKey
  declare disabledEnv: CreationOptional<string> | null
  declare tutorialOrder: CreationOptional<number> | null
  declare tags: string | undefined
  declare solved: CreationOptional<boolean>
  declare codingChallengeStatus: CreationOptional<number>
  declare hasCodingChallenge: boolean
}

const ChallengeModelInit = (sequelize: Sequelize) => {
  Challenge.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      key: {
        type: DataTypes.ENUM,
        values: CHALLENGE_KEYS
      },
      name: DataTypes.STRING,
      category: DataTypes.STRING,
      tags: DataTypes.STRING,
      description: DataTypes.STRING,
      difficulty: DataTypes.INTEGER,
      mitigationUrl: DataTypes.STRING,
      solved: DataTypes.BOOLEAN,
      disabledEnv: DataTypes.STRING,
      tutorialOrder: DataTypes.NUMBER,
      codingChallengeStatus: DataTypes.NUMBER,
      hasCodingChallenge: DataTypes.BOOLEAN
    },
    {
      tableName: 'Challenges',
      sequelize
    }
  )
}

export { Challenge as ChallengeModel, ChallengeModelInit }
