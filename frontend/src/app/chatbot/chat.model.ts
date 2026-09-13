/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { type ToolCall } from '../Services/chat.service'

export { type ToolCall } from '../Services/chat.service'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  tool_calls?: ToolCall[]
  error?: boolean
}

export interface StoredConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}
