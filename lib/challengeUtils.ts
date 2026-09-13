/*
 * For copyright information, please see the COPYRIGHT file.
 * SPDX-License-Identifier: MIT
 */

// Challenge tracking was removed from this build; these stubs remain only so
// feature routes keep compiling without a solve-notification back channel.

export const challenges: Record<string, any> = {}

export function solveIf (_challenge: any, _condition: () => unknown, _additionalData?: string, _uiBypassed?: boolean): void { /* no-op */ }
export function solve (_challenge: any, _key?: string): void { /* no-op */ }
export function notSolved (_challenge: any): boolean { return true }
export function sendNotification (_message: string): void { /* no-op */ }
