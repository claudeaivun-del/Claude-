import { createGeminiBackedClient } from '../src/index'

async function main() {
  console.log('🔄 Starting Claude AI with Gemini Backend...\n')

  const client = createGeminiBackedClient()

  const response = await client.beta.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: 'مرحبا، اكتب لي برنامج بسيط بـ Python',
      },
    ],
  })

  console.log('Response:', response.content[0].text)
}

main().catch(console.error)
