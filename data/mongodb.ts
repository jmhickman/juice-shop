/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

// @ts-expect-error FIXME due to non-existing type definitions for MarsDB
import * as MarsDB from 'marsdb'

export const reviewsCollection = new MarsDB.Collection('posts')
export const ordersCollection = new MarsDB.Collection('orders')
