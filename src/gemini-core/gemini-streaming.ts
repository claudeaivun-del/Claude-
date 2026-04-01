import { GeminiEngine } from './gemini-engine'

export class GeminiStreaming {
  constructor(private engine: GeminiEngine) {}

  async *stream(prompt: string): AsyncGenerator<string> {
    for await (const chunk of this.engine.streamRequest(prompt)) {
      yield chunk
    }
  }
}
