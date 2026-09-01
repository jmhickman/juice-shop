import type { AddressModel } from '@lollo-logistics/models/address'
import type { BasketModel } from '@lollo-logistics/models/basket'
import type { BasketItemModel } from '@lollo-logistics/models/basketitem'
import type { CaptchaModel } from '@lollo-logistics/models/captcha'
import type { CardModel } from '@lollo-logistics/models/card'
import type { ChallengeModel } from '@lollo-logistics/models/challenge'
import type { DeliveryModel } from '@lollo-logistics/models/delivery'
import type { MemoryModel } from '@lollo-logistics/models/memory'
import type { ProductModel } from '@lollo-logistics/models/product'
import type { RecycleModel } from '@lollo-logistics/models/recycle'
import type { SecurityAnswerModel } from '@lollo-logistics/models/securityAnswer'
import type { SecurityQuestionModel } from '@lollo-logistics/models/securityQuestion'
import type { UserModel } from '@lollo-logistics/models/user'

export type Challenge = ChallengeModel

export type User = UserModel

export type Delivery = DeliveryModel

export type Address = AddressModel

export type Card = CardModel

export type Product = ProductModel

export interface Review {
  text: string
  author: string
  liked: boolean
  likedBy: string[]
}

export type Memory = MemoryModel

export type Recycle = RecycleModel

export type SecurityQuestion = SecurityQuestionModel

export type SecurityAnswer = SecurityAnswerModel

export type Basket = BasketModel

export type BasketItem = BasketItemModel

export type Captcha = CaptchaModel
