// ============================================================================
// Agents & Skills — AI Conversation Manager
// ============================================================================
// Guides users through creating agents or skills via conversational AI.
// Falls back to mock conversations when API key is not configured.
// ============================================================================

import { useSettingsStore } from '@/stores/settings';
import { useAgentsSkillsStore } from '@/stores/agents-skills';

export type CreationType = 'agent' | 'skill';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type AIResponse =
  | {
      done: false;
      question: string;
      suggestions: string[];
      helper_text: string | null;
    }
  | AgentCompletionResponse
  | SkillCompletionResponse;

export interface AgentCompletionResponse {
  done: true;
  type: 'agent';
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  maxTurns: number;
}

export interface SkillCompletionResponse {
  done: true;
  type: 'skill';
  name: string;
  description: string;
  trigger: string;
  instructions: string;
  agentId: string | null;
}

const OPENROUTER_API = 'https://openrouter.ai/api/v1/chat/completions';

function buildSystemPrompt(creationType: CreationType): string {
  const agents = useAgentsSkillsStore.getState().agents;
  const skills = useAgentsSkillsStore.getState().skills;

  const agentsList = agents.map((a) => `- ${a.name} (${a.status}): ${a.description}`).join('\n');
  const skillsList = skills.map((s) => `- ${s.name} → trigger: ${s.trigger}, agent: ${s.agentId || 'none'}`).join('\n');

  if (creationType === 'agent') {
    return `You are an AI configuration specialist helping a user define a new agent for their development operations platform (StageManager). An agent is an AI-powered worker that performs specific tasks — like generating charters, scoring issues, or translating build output.

## Your Goal
Guide the user through defining a new agent. You need to determine:
1. What the agent does (name, description)
2. Which AI model it should use
3. What its system prompt should be
4. What tools it needs access to
5. How many turns it should run (max iterations)

## Existing Agents
${agentsList || 'None yet.'}

## Existing Skills
${skillsList || 'None yet.'}

## Behavior Rules
- Ask one clear, focused question at a time.
- Keep questions conversational and specific.
- If the user is vague, ask follow-up questions to clarify.
- Suggest concrete options when possible.
- Typically 3-5 questions is sufficient.
- Do NOT ask about topics the user has already covered.

## Available Models
- anthropic/claude-sonnet-4 — Best for complex reasoning, generation, and multi-step tasks
- anthropic/claude-haiku — Best for fast, analytical tasks and lightweight processing

## Common Tools
- scaffolding-reader: Access scaffolding documents (company context, tech prefs, brand standards)
- intake-parser: Parse idea intake answers
- charter-writer: Generate and store charters
- issue-reader: Read issue details and history
- context-assembler: Assemble project context from multiple sources
- score-writer: Write structured scores
- pattern-matcher: Match patterns in text output
- phase-detector: Detect build phases from output
- code-analyzer: Analyze code structure and quality
- test-runner: Execute and report on tests
- deploy-checker: Verify deployment readiness

## Response Format
Respond with valid JSON matching one of these schemas:

When asking a question:
{
  "done": false,
  "question": "Your question text",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "helper_text": "Optional context or null"
}

When you have enough information:
{
  "done": true,
  "type": "agent",
  "name": "Agent Name",
  "description": "What this agent does",
  "model": "anthropic/claude-sonnet-4 or anthropic/claude-haiku",
  "systemPrompt": "The full system prompt for this agent",
  "tools": ["tool-1", "tool-2"],
  "maxTurns": 10
}

Respond ONLY with the JSON object. No markdown, no explanation, no code fences.`;
  }

  return `You are an AI configuration specialist helping a user define a new skill for their development operations platform (StageManager). A skill is a triggered capability that can be invoked by users or the system — like generating a charter, scoring an issue, or checking for duplicates. Skills are optionally linked to agents.

## Your Goal
Guide the user through defining a new skill. You need to determine:
1. What the skill does (name, description)
2. How it's triggered (slash command)
3. Detailed instructions for execution
4. Which agent should execute it (optional)

## Existing Agents
${agentsList || 'None yet.'}

## Existing Skills
${skillsList || 'None yet.'}

## Behavior Rules
- Ask one clear, focused question at a time.
- Keep questions conversational and specific.
- If the user is vague, ask follow-up questions to clarify.
- Suggest concrete options when possible.
- Typically 3-5 questions is sufficient.
- Do NOT ask about topics the user has already covered.
- When suggesting an agent to link, reference existing agents by name.

## Response Format
Respond with valid JSON matching one of these schemas:

When asking a question:
{
  "done": false,
  "question": "Your question text",
  "suggestions": ["Option 1", "Option 2", "Option 3"],
  "helper_text": "Optional context or null"
}

When you have enough information:
{
  "done": true,
  "type": "skill",
  "name": "Skill Name",
  "description": "What this skill does",
  "trigger": "/skill-trigger",
  "instructions": "Detailed execution instructions",
  "agentId": "agent-id or null"
}

Respond ONLY with the JSON object. No markdown, no explanation, no code fences.`;
}

function buildMessages(
  systemPrompt: string,
  conversationHistory: ConversationMessage[],
  creationType: CreationType
): Array<{ role: string; content: string }> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory.length === 0) {
    const initMessage =
      creationType === 'agent'
        ? 'The user wants to create a new agent. Start by asking what task or capability the agent should handle.'
        : 'The user wants to create a new skill. Start by asking what the skill should do.';
    messages.push({ role: 'user', content: initMessage });
  } else {
    for (const msg of conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  return messages;
}

function parseAIResponse(content: string): AIResponse {
  try {
    return JSON.parse(content) as AIResponse;
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIResponse;
    }
    throw new Error('Failed to parse AI response as JSON');
  }
}

// Mock responses for when API is not configured
const MOCK_AGENT_FLOW: AIResponse[] = [
  {
    done: false,
    question: 'What task or capability should this new agent handle?',
    suggestions: ['Code review', 'Documentation generation', 'Test writing', 'Deployment verification'],
    helper_text: 'Think about a specific responsibility you want to automate.',
  },
  {
    done: false,
    question: 'How complex are the tasks this agent will perform? This helps determine the right model.',
    suggestions: ['Complex reasoning needed', 'Straightforward analysis', 'Pattern matching'],
    helper_text: 'Complex tasks benefit from Sonnet; simpler tasks can use the faster Haiku model.',
  },
  {
    done: false,
    question: 'What tools or data sources should this agent have access to?',
    suggestions: ['Code files', 'Project context', 'Test results', 'Build output'],
    helper_text: null,
  },
  {
    done: true,
    type: 'agent',
    name: 'Code Reviewer',
    description: 'Performs automated code review on new changes, checking for quality, patterns, and potential issues.',
    model: 'anthropic/claude-sonnet-4',
    systemPrompt: 'You are a code review specialist. Analyze code changes for quality, adherence to patterns, potential bugs, and suggest improvements.',
    tools: ['code-analyzer', 'context-assembler', 'pattern-matcher'],
    maxTurns: 8,
  },
];

const MOCK_SKILL_FLOW: AIResponse[] = [
  {
    done: false,
    question: 'What should this skill do when triggered?',
    suggestions: ['Run a health check', 'Generate a report', 'Analyze code quality', 'Create documentation'],
    helper_text: 'Skills are triggered actions that perform a specific task.',
  },
  {
    done: false,
    question: 'What slash command should trigger this skill?',
    suggestions: ['/health-check', '/report', '/analyze', '/docs'],
    helper_text: 'Choose a short, memorable command. It will be available to users in the interface.',
  },
  {
    done: false,
    question: 'Should this skill be linked to an existing agent, or run independently?',
    suggestions: ['Link to Charter Architect', 'Link to Issue Scorer', 'Run independently'],
    helper_text: 'Linking to an agent gives the skill access to that agent\'s capabilities.',
  },
  {
    done: true,
    type: 'skill',
    name: 'Health Check',
    description: 'Runs a health check across all configured environment servers and reports their status.',
    trigger: '/health-check',
    instructions: 'Connect to each configured environment server. Test connectivity, check agent availability, and report back with a summary of each server\'s health status.',
    agentId: null,
  },
];

function getMockResponse(
  conversationHistory: ConversationMessage[],
  creationType: CreationType
): AIResponse {
  const flow = creationType === 'agent' ? MOCK_AGENT_FLOW : MOCK_SKILL_FLOW;
  // Step = number of user messages
  const userMessages = conversationHistory.filter((m) => m.role === 'user').length;
  const idx = Math.min(userMessages, flow.length - 1);
  return flow[idx];
}

export async function sendConversationMessage(
  conversationHistory: ConversationMessage[],
  creationType: CreationType
): Promise<AIResponse> {
  const { aiSettings } = useSettingsStore.getState();
  const useMock =
    import.meta.env.VITE_USE_MOCK_DATA !== 'false' ||
    !aiSettings.openrouterApiKey ||
    aiSettings.keyStatus !== 'valid' ||
    !aiSettings.conversationEnabled;

  if (useMock) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    return getMockResponse(conversationHistory, creationType);
  }

  const systemPrompt = buildSystemPrompt(creationType);
  const messages = buildMessages(systemPrompt, conversationHistory, creationType);

  const response = await fetch(OPENROUTER_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${aiSettings.openrouterApiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'StageManager Agent & Skill Creator',
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
