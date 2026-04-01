import { GeminiAnthropicAdapter } from '../adapters/gemini-anthropic-adapter'

export function setupGeminiBackend(): void {
  console.log('🚀 Initializing Gemini Backend for Claude...')
}

export function getGeminiAdapter(): GeminiAnthropicAdapter {
  return new GeminiAnthropicAdapter()
}
