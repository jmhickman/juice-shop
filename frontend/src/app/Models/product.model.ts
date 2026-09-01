/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

export interface Product {
  id: number
  name: string
  description: string
  image: string
  price: number
  points?: number
  deluxePrice: number
}

export type ProductTableEntry = Product & { quantity?: number }
