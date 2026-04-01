import { GeminiEngine } from '../gemini-core/gemini-engine'
import { ResponseTransformer } from '../transformers/response-transformer'
import { RequestTransformer } from '../transformers/request-transformer'
import { BetaMessage, BetaMessageCreateParams, BetaRawMessageStreamEvent } from '../types/claude-types'
import { EventEmitter } from 'events'

export class GeminiAnthropicAdapter {
  private geminiEngine: GeminiEngine
  private responseTransformer: ResponseTransformer
  private requestTransformer: RequestTransformer

  constructor() {
    this.geminiEngine = new GeminiEngine()
    this.responseTransformer = new ResponseTransformer()
    this.requestTransformer = new RequestTransformer()
  }

  async create(params: BetaMessageCreateParams): Promise<BetaMessage> {
    try {
      const geminiPrompt = this.requestTransformer.claudeToGemini(params)
      const geminiResponse = await this.geminiEngine.sendTextRequest(geminiPrompt)

      return this.responseTransformer.geminiToClaudeMessage(
        geminiResponse,
        params.model,
        params.max_tokens
      )
    } catch (error) {
      throw this.handleError(error)
    }
  }

  stream(params: BetaMessageCreateParams): any {
    const geminiPrompt = this.requestTransformer.claudeToGemini(params)
    const self = this

    const streamImpl = new StreamAdapter(
      async function* () {
        let contentBlockIndex = 0

        for await (const chunk of self.geminiEngine.streamRequest(geminiPrompt)) {
          yield* self.responseTransformer.transformToClaudeStreamEvents(
            chunk,
            contentBlockIndex
          )
          contentBlockIndex++
        }
      },
      params.model
    )

    return streamImpl
  }

  async testConnection(): Promise<boolean> {
    return this.geminiEngine.testConnection()
  }

  private handleError(error: any): Error {
    if (error instanceof Error) {
      return new Error(`Gemini Backend Error: ${error.message}`)
    }
    return new Error('Unknown Gemini Backend Error')
  }
}

class StreamAdapter extends EventEmitter {
  private iteratorPromise: Promise<AsyncGenerator<BetaRawMessageStreamEvent>>
  private _controller: AbortController

  constructor(
    private generator: () => AsyncGenerator<BetaRawMessageStreamEvent>,
    private model: string
  ) {
    super()
    this._controller = new AbortController()
    this.iteratorPromise = Promise.resolve(this.generator())
  }

  get controller(): AbortController {
    return this._controller
  }

  async *[Symbol.asyncIterator](): AsyncIterator<BetaRawMessageStreamEvent> {
    const iterator = await this.iteratorPromise
    try {
      for await (const event of iterator) {
        if (this._controller.signal.aborted) {
          throw new Error('Stream aborted')
        }
        yield event
      }
    } finally {
      this._controller.abort()
    }
  }
}
