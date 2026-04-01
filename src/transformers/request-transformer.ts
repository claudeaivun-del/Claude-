import { BetaMessageCreateParams } from '../types/claude-types'

export class RequestTransformer {
  claudeToGemini(params: BetaMessageCreateParams): string {
    const messages = params.messages || []
    const systemPrompt = params.system || ''

    let prompt = ''

    if (systemPrompt) {
      prompt += `System: ${systemPrompt}\n\n`
    }

    for (const msg of messages) {
      const role = msg.role === 'user' ? 'User' : 'Assistant'
      const content =
        typeof msg.content === 'string'
          ? msg.content
          : msg.content
              .filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('\n')

      prompt += `${role}: ${content}\n\n`
    }

    return prompt.trim()
  }

  transformTools(tools: any[] | undefined): string {
    if (!tools || tools.length === 0) return ''

    let toolsStr = '\nAvailable Tools:\n'
    for (const tool of tools) {
      toolsStr += `- ${tool.function?.name}: ${tool.function?.description}\n`
    }

    return toolsStr
  }
}
