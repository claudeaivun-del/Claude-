import { createGeminiBackedClient } from '../src/index'

async function main() {
  console.log('🔄 Starting Streaming Test...\n')

  const client = createGeminiBackedClient()

  const stream = client.beta.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: 'اكتب قصة قصيرة',
      },
    ],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      process.stdout.write(event.delta.text)
    }
  }

  console.log('\n\n✅ Streaming complete!')
}

main().catch(console.error)
