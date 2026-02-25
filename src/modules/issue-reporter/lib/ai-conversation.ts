// ============================================================================
// Issue Reporter — AI Conversation Manager
// ============================================================================
// Builds prompts, sends requests to OpenRouter, and parses responses.
// Falls back to mock conversations when API key is not configured.
// ============================================================================

import { useSettingsStore } from '@/stores/settings';
import { buildAIContext } from './context-builder';
import { getMockResponse } from './mock-data';
import type { AIContext, AIResponse, ConversationMessage } from '../types';

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

function buildSystemPrompt(context: AIContext): string {
  const parts: string[] = [];

  parts.push(`You are an issue intake specialist for a software development team at a custom manufacturing company. Your job is to guide the user through reporting a problem or requesting an enhancement for one of their existing internal applications.

IMPORTANT: This flow is for issues with EXISTING applications only — bugs (something broke) or feature requests (enhancements to an existing app). If the user is describing an entirely new product or application, let them know this should be submitted as an Idea instead.

## Behavior Rules
- Ask one clear, focused question at a time.
- Keep questions conversational and specific.
- If the user's response is vague, ask a follow-up to clarify.
- If you recognize what they're describing based on the project context, reference specific components or systems by name.
- If their description matches an existing issue, surface that potential duplicate.
- NEVER ask the user to classify their submission as bug or feature — you determine that.
- Typically 3-6 questions is sufficient. Reach a conclusion efficiently.

## Classification Rules
Classify as 'bug' if: something was working and stopped, behavior doesn't match expectations, errors or crashes, data loss, visual/UI defects in an existing application.
Classify as 'feature' if: an enhancement to an existing application — workflow improvement, new capability, additional functionality, or UI/UX refinement for a product that already exists.

## Severity Assessment
- critical: System unusable, data loss, security issue
- high: Major feature broken, significant workflow impact
- medium: Issue with workaround, moderate inconvenience
- low: Cosmetic, minor annoyance, nice-to-have improvement

## Response Format
You MUST respond with valid JSON matching one of these schemas:

When asking a question:
{
  "done": false,
  "question": "Your question text",
  "suggestions": ["Tag 1", "Tag 2", "Tag 3"],
  "helper_text": "Optional helper text or null"
}

When you have enough information to complete the report:
{
  "done": true,
  "classification": "bug" or "feature",
  "title": "Concise issue title",
  "description": "Structured, actionable description",
  "severity": "critical|high|medium|low",
  "steps_to_reproduce": ["Step 1", "Step 2"] or null,
  "expected_behavior": "string" or null,
  "actual_behavior": "string" or null,
  "desired_outcome": "string" or null,
  "affected_area": "Which component or section",
  "potential_duplicates": [{"issueId": "id", "title": "title", "similarity_reason": "why"}],
  "conversation_summary": "Brief summary of the conversation"
}

Respond ONLY with the JSON object. No markdown, no explanation, no code fences.`);

  if (context.scaffolding) {
    parts.push(`\n## Project Context (Scaffolding)\n${context.scaffolding}`);
  }

  if (context.charterExecutionPlan) {
    parts.push(`\n## Charter & Execution Plan\n${context.charterExecutionPlan}`);
  }

  if (context.existingIssues.length > 0) {
    const issuesList = context.existingIssues
      .map(
        (i) =>
          `- [${i.id}] (${i.type}, ${i.status}, ${i.severity}) ${i.title}: ${i.description.slice(0, 150)}...`
      )
      .join('\n');
    parts.push(`\n## Existing Issues\nCheck if the user's report matches any of these:\n${issuesList}`);
  }

  return parts.join('\n');
}

function buildMessages(
  systemPrompt: string,
  conversationHistory: ConversationMessage[],
  projectId: string | null
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory.length === 0) {
    // Initialization — tell the AI to start
    const initMessage = projectId
      ? `The user is reporting an issue for project ID: ${projectId}. Start by asking what they're experiencing.`
      : `The user wants to report an issue but hasn't specified which application. Start by asking which application or project this is about.`;
    messages.push({ role: 'user', content: initMessage });
  } else {
    for (const msg of conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  return messages;
}

function parseAIResponse(content: string): AIResponse {
  // Try direct parse
  try {
    return JSON.parse(content) as AIResponse;
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIResponse;
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function sendConversationMessage(
  conversationHistory: ConversationMessage[],
  projectId: string | null
): Promise<AIResponse> {
  const { aiSettings } = useSettingsStore.getState();
  const useMock =
    import.meta.env.VITE_USE_MOCK_DATA !== 'false' ||
    !aiSettings.openrouterApiKey ||
    aiSettings.keyStatus !== 'valid' ||
    !aiSettings.conversationEnabled;

  if (useMock) {
    // Simulate response timing
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
    return getMockResponse(conversationHistory, projectId);
  }

  const context = buildAIContext(projectId);
  const systemPrompt = buildSystemPrompt(context);
  const messages = buildMessages(systemPrompt, conversationHistory, projectId);

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiSettings.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'StageManager Issue Reporter',
    },
    body: JSON.stringify({
      model: aiSettings.conversationModel || 'anthropic/claude-sonnet-4',
      messages,
      max_tokens: 2048,
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from AI');
  }

  return parseAIResponse(content);
}
