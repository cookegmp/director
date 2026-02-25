// ============================================================================
// Issue Scoring — Bug Scorer
// ============================================================================
// Scores bugs across five dimensions using AI (OpenRouter) with a
// rules-based fallback when AI is unavailable.
// ============================================================================

import { useSettingsStore } from '@/stores/settings';
import type { ReportedIssue } from '@/modules/issue-reporter/types';
import type { IssueScore, BugWeights, DimensionScore } from '../types';
import { getBugScoreTier } from '../types';
import { buildDimensionScore, calculateComposite, clampScore } from './score-calculator';
import type { ScoringContext } from './context-assembler';

// --- AI Scoring ---

function buildBugScoringPrompt(issue: ReportedIssue, context: ScoringContext): string {
  return `You are a bug scoring engine. Evaluate this bug report across five dimensions and return a JSON response.

## Bug Report
- Title: ${issue.title}
- Description: ${issue.description}
- Severity (reporter-assigned): ${issue.severity}
- Affected Area: ${issue.affected_area ?? 'Unknown'}
- Steps to Reproduce: ${issue.steps_to_reproduce?.join('; ') ?? 'Not provided'}
- Expected Behavior: ${issue.expected_behavior ?? 'Not provided'}
- Actual Behavior: ${issue.actual_behavior ?? 'Not provided'}
- Conversation Summary: ${issue.conversation_summary ?? 'Not provided'}
- Has Screenshot: ${issue.screenshot ? 'Yes' : 'No'}

## Project Context
${context.charterContent || 'No charter available for this project.'}

## Existing Issues (${context.existingIssues.length} total)
${context.existingIssues.slice(0, 10).map((i) => `- [${i.type}/${i.severity}/${i.status}] ${i.title}`).join('\n') || 'None'}

## Instructions
Score each dimension 0-100. Return ONLY valid JSON:
{
  "severity": { "score": <number>, "explanation": "<one sentence>" },
  "blast_radius": { "score": <number>, "explanation": "<one sentence>" },
  "reproducibility": { "score": <number>, "explanation": "<one sentence>" },
  "remediation_confidence": { "score": <number>, "explanation": "<one sentence>" },
  "recurrence": { "score": <number>, "explanation": "<one sentence>" }
}`;
}

interface AIDimensionResult {
  score: number;
  explanation: string;
}

async function scoreWithAI(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: BugWeights
): Promise<DimensionScore[]> {
  const aiSettings = useSettingsStore.getState().aiSettings;
  const prompt = buildBugScoringPrompt(issue, context);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiSettings.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
    },
    body: JSON.stringify({
      model: aiSettings.scoringModel || 'anthropic/claude-haiku',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error: ${response.status}`);

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  let parsed: Record<string, AIDimensionResult>;
  try {
    parsed = JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse AI scoring response');
    }
  }

  return [
    buildDimensionScore('severity', parsed.severity.score, weights.severity, parsed.severity.explanation),
    buildDimensionScore('blast_radius', parsed.blast_radius.score, weights.blast_radius, parsed.blast_radius.explanation),
    buildDimensionScore('reproducibility', parsed.reproducibility.score, weights.reproducibility, parsed.reproducibility.explanation),
    buildDimensionScore('remediation_confidence', parsed.remediation_confidence.score, weights.remediation_confidence, parsed.remediation_confidence.explanation),
    buildDimensionScore('recurrence', parsed.recurrence.score, weights.recurrence, parsed.recurrence.explanation),
  ];
}

// --- Rules Fallback ---

function scoreWithRules(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: BugWeights
): DimensionScore[] {
  // Severity: map from reporter-assigned severity
  const severityMap: Record<string, number> = { critical: 95, high: 75, medium: 50, low: 25 };
  let severityScore = severityMap[issue.severity] ?? 50;
  const descLower = (issue.description + ' ' + (issue.actual_behavior ?? '')).toLowerCase();
  if (descLower.includes('data loss') || descLower.includes('corruption')) severityScore += 15;
  if (descLower.includes('security') || descLower.includes('vulnerability')) severityScore += 15;
  if (descLower.includes('workaround')) severityScore -= 10;
  if (descLower.includes('intermittent')) severityScore -= 5;

  // Blast radius: map affected area against charter phases
  let blastScore = 50;
  if (context.charter && issue.affected_area) {
    const areaLower = issue.affected_area.toLowerCase();
    const phases = context.charter.content.executionPlan;
    const phase1Tasks = phases[0]?.tasks.join(' ').toLowerCase() ?? '';
    const allTasks = phases.map((p) => p.tasks.join(' ')).join(' ').toLowerCase();
    if (phase1Tasks.includes(areaLower) || areaLower.includes('core') || areaLower.includes('foundation')) {
      blastScore = 85;
    } else if (allTasks.includes(areaLower)) {
      blastScore = 60;
    } else if (areaLower.includes('admin') || areaLower.includes('settings')) {
      blastScore = 35;
    }
  }
  if (descLower.includes('everyone') || descLower.includes('all users')) blastScore += 15;
  if (descLower.includes('just me') || descLower.includes('only i')) blastScore -= 20;

  // Reproducibility: based on steps and frequency
  let reproScore = 40;
  const hasSteps = issue.steps_to_reproduce && issue.steps_to_reproduce.length > 0;
  const freqLower = (issue.conversation_summary ?? '').toLowerCase();
  if (hasSteps && freqLower.includes('every time')) reproScore = 90;
  else if (hasSteps && freqLower.includes('most')) reproScore = 75;
  else if (hasSteps && freqLower.includes('occasional')) reproScore = 55;
  else if (hasSteps) reproScore = 65;
  else if (descLower.length > 200) reproScore = 40;
  else reproScore = 20;
  if (issue.screenshot) reproScore += 10;

  // Remediation confidence: based on charter documentation quality
  let remConfScore = 45;
  if (context.charter && issue.affected_area) {
    const charterText = context.charterContent.toLowerCase();
    const areaLower = issue.affected_area.toLowerCase();
    if (charterText.includes(areaLower)) remConfScore = 75;
    else remConfScore = 20;
  }
  if (descLower.includes('ui') || descLower.includes('visual') || descLower.includes('display')) remConfScore += 10;
  if (descLower.includes('api') || descLower.includes('database') || descLower.includes('integration')) remConfScore -= 10;
  if (descLower.includes('cross-component') || descLower.includes('multiple')) remConfScore -= 15;

  // Recurrence: check existing issues for similar reports
  let recurrenceScore = 30;
  const existingSimilar = context.existingIssues.filter((i) => {
    if (i.type !== 'bug') return false;
    if (issue.affected_area && i.description.toLowerCase().includes(issue.affected_area.toLowerCase())) return true;
    const titleWords = issue.title.toLowerCase().split(' ').filter((w) => w.length > 4);
    return titleWords.some((w) => i.title.toLowerCase().includes(w));
  });
  if (existingSimilar.length >= 2) recurrenceScore = 80;
  else if (existingSimilar.length === 1) {
    recurrenceScore = existingSimilar[0]!.status === 'open' || existingSimilar[0]!.status === 'in-progress' ? 70 : 60;
  } else if (context.existingIssues.length === 0) recurrenceScore = 10;

  return [
    buildDimensionScore('severity', severityScore, weights.severity, `Mapped from reporter severity: ${issue.severity}`),
    buildDimensionScore('blast_radius', blastScore, weights.blast_radius, issue.affected_area ? `Affected area: ${issue.affected_area}` : 'Affected area not specified'),
    buildDimensionScore('reproducibility', reproScore, weights.reproducibility, hasSteps ? `${issue.steps_to_reproduce!.length} steps provided` : 'No steps to reproduce provided'),
    buildDimensionScore('remediation_confidence', remConfScore, weights.remediation_confidence, context.charter ? 'Evaluated against charter documentation' : 'No charter context available'),
    buildDimensionScore('recurrence', recurrenceScore, weights.recurrence, `${existingSimilar.length} similar issue(s) found`),
  ];
}

// --- Public API ---

export async function scoreBug(
  issue: ReportedIssue,
  context: ScoringContext,
  weights: BugWeights
): Promise<IssueScore> {
  const aiSettings = useSettingsStore.getState().aiSettings;
  const useAI =
    aiSettings.scoringEnabled &&
    aiSettings.openrouterApiKey &&
    aiSettings.keyStatus === 'valid';

  let dimensions: DimensionScore[];
  let scoredBy: IssueScore['scored_by'];

  if (useAI) {
    try {
      dimensions = await scoreWithAI(issue, context, weights);
      scoredBy = 'ai';
    } catch (err) {
      console.warn('AI bug scoring failed, falling back to rules:', err);
      dimensions = scoreWithRules(issue, context, weights);
      scoredBy = 'rules_fallback';
    }
  } else {
    dimensions = scoreWithRules(issue, context, weights);
    scoredBy = 'rules_fallback';
  }

  const composite = calculateComposite(dimensions);

  return {
    issue_id: issue.id,
    score_type: 'bug',
    composite_score: clampScore(composite),
    tier: getBugScoreTier(composite),
    dimensions,
    remediation_status: null,
    remediation_session_id: null,
    scored_at: new Date().toISOString(),
    scored_by: scoredBy,
  };
}
