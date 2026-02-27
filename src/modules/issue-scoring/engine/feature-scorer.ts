// ============================================================================
// Issue Scoring — Feature Request Scorer
// ============================================================================
// Scores feature requests across four dimensions using AI (OpenRouter)
// with a rules-based fallback when AI is unavailable.
// ============================================================================

import { useSettingsStore } from '@/stores/settings'
import type { ReportedIssue } from '@/modules/issue-reporter/types'
import type { IssueScore, FeatureWeights, DimensionScore } from '../types'
import { getFeatureScoreTier } from '../types'
import { buildDimensionScore, calculateComposite, clampScore } from './score-calculator'
import type { ScoringContext } from './context-assembler'

// --- AI Scoring ---

function buildFeatureScoringPrompt(issue: ReportedIssue, context: ScoringContext): string {
  return `You are a feature request scoring engine. Evaluate this feature request across four dimensions and return a JSON response.

## Feature Request
- Title: ${issue.title}
- Description: ${issue.description}
- Desired Outcome: ${issue.desired_outcome ?? 'Not provided'}
- Affected Area: ${issue.affected_area ?? 'Unknown'}
- Conversation Summary: ${issue.conversation_summary ?? 'Not provided'}

## Project Context
${context.charterContent || 'No charter available for this project.'}

## Existing Issues (${context.existingIssues.length} total)
${
  context.existingIssues
    .slice(0, 10)
    .map((i) => `- [${i.type}/${i.severity}/${i.status}] ${i.title}`)
    .join('\n') || 'None'
}

## Instructions
Score each dimension 0-100. Note: complexity is INVERSELY scored (higher = less complex = more feasible).
Return ONLY valid JSON:
{
  "demand": { "score": <number>, "explanation": "<one sentence>" },
  "alignment": { "score": <number>, "explanation": "<one sentence>" },
  "complexity": { "score": <number>, "explanation": "<one sentence — higher means simpler/more feasible>" },
  "impact": { "score": <number>, "explanation": "<one sentence>" }
}`
}

interface AIDimensionResult {
  score: number
  explanation: string
}

async function scoreWithAI(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: FeatureWeights,
): Promise<DimensionScore[]> {
  const aiSettings = useSettingsStore.getState().aiSettings
  const prompt = buildFeatureScoringPrompt(issue, context)

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiSettings.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: aiSettings.featureScoringModel || 'anthropic/claude-haiku',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  })

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`)

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  let parsed: Record<string, AIDimensionResult>
  try {
    parsed = JSON.parse(content)
  } catch {
    const match = content.match(/\{[\s\S]*\}/)
    if (match) {
      parsed = JSON.parse(match[0])
    } else {
      throw new Error('Failed to parse AI scoring response')
    }
  }

  return [
    buildDimensionScore('demand', parsed.demand.score, weights.demand, parsed.demand.explanation),
    buildDimensionScore(
      'alignment',
      parsed.alignment.score,
      weights.alignment,
      parsed.alignment.explanation,
    ),
    buildDimensionScore(
      'complexity',
      parsed.complexity.score,
      weights.complexity,
      parsed.complexity.explanation,
    ),
    buildDimensionScore('impact', parsed.impact.score, weights.impact, parsed.impact.explanation),
  ]
}

// --- Rules Fallback ---

function scoreWithRules(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: FeatureWeights,
): DimensionScore[] {
  const descLower = (issue.description + ' ' + (issue.desired_outcome ?? '')).toLowerCase()

  // Demand: check for similar feature requests
  let demandScore = 40
  const similarFeatures = context.existingIssues.filter((i) => {
    if (i.type !== 'feature-request') return false
    const titleWords = issue.title
      .toLowerCase()
      .split(' ')
      .filter((w) => w.length > 4)
    return titleWords.some((w) => i.title.toLowerCase().includes(w))
  })
  if (similarFeatures.length >= 2) demandScore = 90
  else if (similarFeatures.length === 1) demandScore = 75
  if (
    descLower.includes('team') ||
    descLower.includes('everyone') ||
    descLower.includes('department')
  )
    demandScore = Math.max(demandScore, 65)
  if (
    descLower.includes('personal') ||
    descLower.includes('just me') ||
    descLower.includes('i would')
  )
    demandScore = Math.min(demandScore, 30)

  // Alignment: check against charter objectives
  let alignmentScore = 50
  if (context.charter) {
    const objectives = context.charter.content.objectives.join(' ').toLowerCase()
    const desiredLower = (issue.desired_outcome ?? issue.description).toLowerCase()
    const keywords = desiredLower.split(' ').filter((w) => w.length > 5)
    const matchCount = keywords.filter((w) => objectives.includes(w)).length
    if (matchCount >= 3) alignmentScore = 85
    else if (matchCount >= 1) alignmentScore = 60
    else alignmentScore = 30
  }

  // Complexity (inverse — higher = simpler)
  let complexityScore = 50
  if (
    descLower.includes('minor') ||
    descLower.includes('simple') ||
    descLower.includes('toggle') ||
    descLower.includes('config')
  ) {
    complexityScore = 85
  } else if (
    descLower.includes('extend') ||
    descLower.includes('add option') ||
    descLower.includes('new column')
  ) {
    complexityScore = 70
  } else if (descLower.includes('new component') || descLower.includes('new page')) {
    complexityScore = 50
  } else if (
    descLower.includes('database') ||
    descLower.includes('integration') ||
    descLower.includes('new api')
  ) {
    complexityScore = 30
  } else if (
    descLower.includes('architecture') ||
    descLower.includes('redesign') ||
    descLower.includes('migration')
  ) {
    complexityScore = 15
  }

  // Impact: workflow improvement signals
  let impactScore = 50
  if (
    descLower.includes('daily') ||
    descLower.includes('every day') ||
    descLower.includes('constantly')
  )
    impactScore = 80
  else if (
    descLower.includes('new capability') ||
    descLower.includes('not possible') ||
    descLower.includes('cannot currently')
  )
    impactScore = 70
  else if (descLower.includes('occasional') || descLower.includes('sometimes')) impactScore = 50
  else if (
    descLower.includes('cosmetic') ||
    descLower.includes('nice to have') ||
    descLower.includes('convenience')
  )
    impactScore = 30

  return [
    buildDimensionScore(
      'demand',
      demandScore,
      weights.demand,
      `${similarFeatures.length} similar request(s) found`,
    ),
    buildDimensionScore(
      'alignment',
      alignmentScore,
      weights.alignment,
      context.charter ? 'Evaluated against charter objectives' : 'No charter context available',
    ),
    buildDimensionScore(
      'complexity',
      complexityScore,
      weights.complexity,
      'Estimated from description keywords (inverse: higher = simpler)',
    ),
    buildDimensionScore(
      'impact',
      impactScore,
      weights.impact,
      'Estimated from workflow impact signals',
    ),
  ]
}

// --- Public API ---

export async function scoreFeature(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: FeatureWeights,
): Promise<IssueScore> {
  const aiSettings = useSettingsStore.getState().aiSettings
  const useAI =
    aiSettings.featureScoringEnabled &&
    aiSettings.openrouterApiKey &&
    aiSettings.keyStatus === 'valid'

  let dimensions: DimensionScore[]
  let scoredBy: IssueScore['scored_by']

  if (useAI) {
    try {
      dimensions = await scoreWithAI(issue, context, weights)
      scoredBy = 'ai'
    } catch (err) {
      console.warn('AI feature scoring failed, falling back to rules:', err)
      dimensions = scoreWithRules(issue, context, weights)
      scoredBy = 'rules_fallback'
    }
  } else {
    dimensions = scoreWithRules(issue, context, weights)
    scoredBy = 'rules_fallback'
  }

  const composite = calculateComposite(dimensions)

  return {
    issue_id: issue.id,
    score_type: 'feature',
    composite_score: clampScore(composite),
    tier: getFeatureScoreTier(composite),
    dimensions,
    remediation_status: null,
    remediation_session_id: null,
    scored_at: new Date().toISOString(),
    scored_by: scoredBy,
  }
}
