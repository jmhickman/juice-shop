/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

export enum ResultState {
  Undecided = 0,
  Right = 1,
  Wrong = 2
}

export interface RandomFixes {
  fix: string
  index: number
}
