import { setupGeminiBackend, getGeminiAdapter } from './integration/setup'
import { createGeminiBackedClient } from './integration/client-wrapper'

// Initialize
setupGeminiBackend()

// Export
export { createGeminiBackedClient, getGeminiAdapter }
export { GeminiAnthropicAdapter } from './adapters/gemini-anthropic-adapter'
export { GeminiEngine } from './gemini-core/gemini-engine'

console.log('✅ Claude AI with Gemini Backend is ready!')
