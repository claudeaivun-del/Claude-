import { BetaMessage, BetaRawMessageStreamEvent, MessageStartEvent, ContentBlockStartEvent, ContentBlockDeltaEvent, ContentBlockStopEvent, MessageDeltaEvent, MessageStopEvent } from '../types/claude-types'
import { v4 as uuidv4 } from 'uuid'

export class ResponseTransformer {
  geminiToClaudeMessage(
    geminiResponse: string,
    model: string = 'claude-3-5-sonnet-20241022',
    maxTokens: number = 4096
  ): BetaMessage {
    return {
      id: `msg_${uuidv4()}`,
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: geminiResponse,
        },
      ],
      model,
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: Math.ceil(geminiResponse.length / 8),
        output_tokens: Math.ceil(geminiResponse.length / 4),
      },
    }
  }

  *transformToClaudeStreamEvents(
    geminiChunk: string,
    blockIndex: number = 0
  ): Generator<BetaRawMessageStreamEvent> {
    const messageId = `msg_${uuidv4()}`

    if (blockIndex === 0) {
      yield {
        type: 'message_start',
        message: {
          id: messageId,
          type: 'message',
          role: 'assistant',
          content: [],
          model: 'claude-3-5-sonnet-20241022',
          stop_reason: null as any,
          stop_sequence: null,
          usage: {
            input_tokens: 0,
            output_tokens: 0,
          },
        },
      } as MessageStartEvent
    }

    yield {
      type: 'content_block_start',
      index: blockIndex,
      content_block: {
        type: 'text',
        text: '',
      },
    } as unknown as ContentBlockStartEvent

    const chunkSize = 1
    for (let i = 0; i < geminiChunk.length; i += chunkSize) {
      const textPart = geminiChunk.slice(i, i + chunkSize)
      yield {
        type: 'content_block_delta',
        index: blockIndex,
        delta: {
          type: 'text_delta',
          text: textPart,
        },
      } as unknown as ContentBlockDeltaEvent
    }

    yield {
      type: 'content_block_stop',
      index: blockIndex,
    } as unknown as ContentBlockStopEvent

    yield {
      type: 'message_delta',
      delta: {
        stop_reason: 'end_turn',
      },
      usage: {
        input_tokens: 0,
        output_tokens: Math.ceil(geminiChunk.length / 4),
      },
    } as unknown as MessageDeltaEvent

    yield {
      type: 'message_stop',
    } as MessageStopEvent
  }
        }
