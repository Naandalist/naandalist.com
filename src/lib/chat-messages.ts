/** Limits for a chat request. The browser sends the full history, so the server must cap it. */
export const MAX_CHAT_MESSAGES = 20
export const MAX_CHAT_MESSAGE_LENGTH = 2000

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Keeps only what the model should see from client input: user and assistant turns with text.
 * A client cannot inject a `system` message, because that role is dropped here.
 * Content is trimmed and capped, only the most recent turns are kept, and the list starts on a
 * user turn, as most providers expect.
 */
export function sanitizeChatMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return []
  const cleaned = input
    .filter((m): m is { role: string; content: string } => Boolean(m) && typeof m === 'object')
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role as ChatMessage['role'], content: m.content.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH) }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_CHAT_MESSAGES)
  const firstUser = cleaned.findIndex((m) => m.role === 'user')
  return firstUser === -1 ? [] : cleaned.slice(firstUser)
}
