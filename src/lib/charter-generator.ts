import type { Idea, CharterContent } from '@/types'

/**
 * Charter generation with mock fallback.
 * When VITE_USE_MOCK_DATA is 'true' or no API key is present, uses mock generation.
 * Otherwise calls the Anthropic API directly (prototype only — client-side).
 */

const USE_MOCK =
  import.meta.env.VITE_USE_MOCK_DATA !== 'false' || !import.meta.env.VITE_ANTHROPIC_API_KEY

export async function generateCharter(idea: Idea): Promise<CharterContent> {
  if (USE_MOCK) {
    return generateMockCharter(idea)
  }
  return generateLiveCharter(idea)
}

function generateMockCharter(idea: Idea): Promise<CharterContent> {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        projectOverview: `This project addresses the identified opportunity: "${idea.title}". Based on the intake analysis, this initiative scores ${Math.round(idea.compositeScore)} on our composite priority scale, indicating ${idea.compositeScore >= 60 ? 'high' : 'moderate'} strategic value. The solution will modernize the current manual process and deliver measurable improvements in efficiency, accuracy, and stakeholder satisfaction.`,
        objectives: [
          `Eliminate the current manual process described: "${idea.intakeAnswers['current-state'] ?? 'legacy workflow'}"`,
          `Deliver the desired outcome: "${idea.intakeAnswers['desired-outcome'] ?? 'improved efficiency'}"`,
          'Provide real-time visibility and reporting for stakeholders',
          'Ensure seamless integration with existing systems and workflows',
          'Achieve measurable ROI within the first quarter of deployment',
        ],
        technicalApproach: `The solution will be built as a modern web application using React with TypeScript for the frontend, backed by Node.js API services. Data persistence will use MS SQL Server for transactional data. The architecture follows a modular component-based design with Zustand for state management, ensuring maintainability and scalability. Authentication will leverage existing Azure AD infrastructure for single sign-on.`,
        acceptanceCriteria: [
          'Users can complete the primary workflow end-to-end without manual intervention',
          'Dashboard provides real-time status visibility for all stakeholders',
          'System handles concurrent users without performance degradation',
          'All data is properly validated and persisted with audit trails',
          'Application is responsive and functional on desktop and tablet devices',
          'Integration points with existing systems are verified and documented',
        ],
        estimatedTimeline: '6-8 weeks for initial prototype, 12 weeks for production-ready release',
        executionPlan: [
          {
            phase: 'Foundation & Architecture',
            tasks: [
              'Set up project repository and CI/CD pipeline',
              'Configure development environment and tooling',
              'Design database schema and data models',
              'Implement authentication and authorization',
            ],
            duration: '1-2 weeks',
            dependencies: [],
          },
          {
            phase: 'Core Features',
            tasks: [
              'Build primary data entry and management interfaces',
              'Implement business logic and validation rules',
              'Create dashboard and reporting views',
              'Develop API endpoints and data access layer',
            ],
            duration: '3-4 weeks',
            dependencies: ['Foundation & Architecture'],
          },
          {
            phase: 'Integration & Polish',
            tasks: [
              'Integrate with existing ERP and business systems',
              'Implement notification and alert workflows',
              'Performance optimization and security hardening',
              'User acceptance testing and feedback incorporation',
            ],
            duration: '2-3 weeks',
            dependencies: ['Core Features'],
          },
          {
            phase: 'Deployment & Handoff',
            tasks: [
              'Production environment setup and configuration',
              'Data migration and validation',
              'User training and documentation',
              'Go-live support and monitoring setup',
            ],
            duration: '1 week',
            dependencies: ['Integration & Polish'],
          },
        ],
      })
    }, 1500)
  })
}

async function generateLiveCharter(idea: Idea): Promise<CharterContent> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string

  const systemPrompt = `You are a technical project charter generator for an AI consulting firm. Generate structured project charters based on intake data. The client is a manufacturing company (Ahaus Tool & Engineering) focused on automation, precision machining, and custom manufacturing.

Respond with valid JSON matching this exact schema:
{
  "projectOverview": "string",
  "objectives": ["string"],
  "technicalApproach": "string",
  "acceptanceCriteria": ["string"],
  "estimatedTimeline": "string",
  "executionPlan": [{ "phase": "string", "tasks": ["string"], "duration": "string", "dependencies": ["string"] }]
}`

  const userMessage = `Generate a project charter for this idea:

Title: ${idea.title}
Composite Score: ${Math.round(idea.compositeScore)}/100

Intake Answers:
- Problem: ${idea.intakeAnswers.problem ?? 'N/A'}
- Impact: ${idea.intakeAnswers.impact ?? 'N/A'}
- Current State: ${idea.intakeAnswers['current-state'] ?? 'N/A'}
- Desired Outcome: ${idea.intakeAnswers['desired-outcome'] ?? 'N/A'}
- Constraints: ${idea.intakeAnswers.constraints ?? 'N/A'}
- Urgency: ${idea.intakeAnswers.urgency ?? 'N/A'}

Score Breakdown:
- Impact: ${idea.scores.impact}/100
- Urgency: ${idea.scores.urgency}/100
- Feasibility: ${idea.scores.feasibility}/100
- Alignment: ${idea.scores.alignment}/100`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    console.error('Anthropic API error:', response.status)
    return generateMockCharter(idea)
  }

  const data = (await response.json()) as { content: Array<{ text: string }> }
  const text = data.content[0]?.text ?? ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as CharterContent
    }
  } catch {
    console.error('Failed to parse charter response')
  }

  return generateMockCharter(idea)
}
