export class GeminiParser {
  parseResponse(responseText: string): string {
    let cleaned = responseText.replace(")]}'", '')
    let bestText = ''

    for (const line of cleaned.split('\n')) {
      if (!line.includes('wrb.fr')) continue

      try {
        const parsed = JSON.parse(line)
        const entries = this.extractWrbFrEntries(parsed)

        for (const entry of entries) {
          try {
            const inner = JSON.parse(entry[2])

            if (Array.isArray(inner) && Array.isArray(inner[4])) {
              for (const block of inner[4]) {
                if (Array.isArray(block) && Array.isArray(block[1])) {
                  const text = block[1]
                    .filter((item: any) => typeof item === 'string')
                    .join('')

                  if (text.length > bestText.length) {
                    bestText = text
                  }
                }
              }
            }
          } catch {
            // تجاهل الأخطاء
          }
        }
      } catch {
        // تجاهل الأخطاء
      }
    }

    return bestText.trim()
  }

  extractText(chunk: string): string {
    try {
      return this.parseResponse(chunk)
    } catch {
      return ''
    }
  }

  private extractWrbFrEntries(data: any): any[] {
    if (!Array.isArray(data)) return []

    if (data[0] === 'wrb.fr') {
      return [data]
    }

    return data.filter(
      (item: any) => Array.isArray(item) && item[0] === 'wrb.fr'
    )
  }
}
