import { useSettingsStore } from '@/stores/settings'
import { mockExtract, mockOcaiGenerate } from './mock-ai'
import type { FlowStep } from './interview-flows'

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions'

function isMockMode(): boolean {
  return import.meta.env.VITE_USE_MOCK_DATA === 'true' || useSettingsStore.getState().mock_mode
}

export async function complete(
  messages: { role: string; content: string }[],
  options: { model?: string; maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  if (isMockMode()) {
    // Return a generic mock response after a delay
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400))
    return JSON.stringify({ result: 'Mock AI response' })
  }

  const apiKey = useSettingsStore.getState().openrouter_api_key
  if (!apiKey) {
    throw new Error('No OpenRouter API key configured. Set it in Settings.')
  }

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Director',
    },
    body: JSON.stringify({
      model: options.model ?? useSettingsStore.getState().selected_models['extraction'] ?? 'anthropic/claude-sonnet-4-5-20250929',
      messages,
      max_tokens: options.maxTokens ?? 4096,
      temperature: options.temperature ?? 0.3,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function extractFromResponse(
  step: FlowStep,
  response: string,
): Promise<Record<string, unknown>> {
  if (isMockMode()) {
    return mockExtract(step, response)
  }

  const result = await complete([
    {
      role: 'system',
      content: `Extract the following fields from the interview response as JSON: ${step.extraction_keys.join(', ')}. Return only valid JSON.`,
    },
    {
      role: 'user',
      content: `Interview prompt: ${step.suggested_question}\n\nResponse: ${response}`,
    },
  ])

  try {
    return JSON.parse(result)
  } catch {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    return { raw_extraction: result }
  }
}

export async function generateOcaiQuestions(
  type: 'level1' | 'level2' | 'analysis',
  context?: unknown,
): Promise<Record<string, unknown>> {
  if (isMockMode()) {
    return mockOcaiGenerate(type, context)
  }

  const result = await complete([
    {
      role: 'system',
      content: type === 'level1'
        ? 'Generate 10-12 behavioral scenario questions for an organizational culture baseline assessment using the Competing Values Framework. Return as JSON with a "questions" array.'
        : type === 'level2'
          ? 'Generate 2-3 workflow-specific culture assessment questions per workflow. Return as JSON with a "questions" array.'
          : 'Analyze the OCAI responses and provide CVF quadrant scores (clan, adhocracy, hierarchy, market as 0-100), gaps array, and summary. Return as JSON.',
    },
    {
      role: 'user',
      content: JSON.stringify(context),
    },
  ])

  try {
    return JSON.parse(result)
  } catch {
    const match = result.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    return { error: 'Failed to parse response' }
  }
}
