import { GeminiAnthropicAdapter } from '../adapters/gemini-anthropic-adapter'

export class AnthropicClientWrapper {
  private adapter: GeminiAnthropicAdapter
  public beta: any

  constructor() {
    this.adapter = new GeminiAnthropicAdapter()

    this.beta = {
      messages: {
        create: (params: any) => this.adapter.create(params),
        stream: (params: any) => this.adapter.stream(params),
      },
    }
  }
}

export function createGeminiBackedClient(): any {
  return new AnthropicClientWrapper()
}
