import type { FlowStep } from './interview-flows'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function mockExtract(
  step: FlowStep,
  response: string,
): Promise<Record<string, unknown>> {
  await delay(600 + Math.random() * 600)

  const extracted: Record<string, unknown> = {}
  for (const key of step.extraction_keys) {
    // Generate a plausible extraction based on the key name
    extracted[key] = response.length > 20
      ? response.slice(0, 80)
      : `Extracted ${key} from response`
  }
  return extracted
}

export async function mockOcaiGenerate(
  type: 'level1' | 'level2' | 'analysis',
  _context?: unknown,
): Promise<Record<string, unknown>> {
  await delay(800 + Math.random() * 400)

  if (type === 'level1') {
    return {
      questions: Array.from({ length: 11 }, (_, i) => ({
        id: `q${i + 1}`,
        text: [
          'The organization is a very personal place. It is like an extended family.',
          'The leadership is considered to exemplify mentoring, facilitating, or nurturing.',
          'The management style is characterized by teamwork, consensus, and participation.',
          'The glue that holds the organization together is loyalty and mutual trust.',
          'The organization emphasizes human development. High trust and participation persist.',
          'Success is defined by development of people, teamwork, and concern for individuals.',
          'The organization is dynamic and entrepreneurial. People take risks.',
          'The organization emphasizes acquiring new resources and creating new challenges.',
          'The organization is controlled and structured. Formal procedures govern.',
          'The organization is results-oriented. People are competitive and achievement-focused.',
          'Success is defined on the basis of efficiency and dependable delivery.',
        ][i],
        category: ['dominant_characteristics', 'organizational_leadership', 'management_style', 'organization_glue', 'strategic_emphasis', 'criteria_of_success', 'dominant_characteristics', 'strategic_emphasis', 'dominant_characteristics', 'dominant_characteristics', 'criteria_of_success'][i],
      })),
    }
  }

  if (type === 'level2') {
    return {
      questions: [
        { id: 'wq1', text: 'This workflow is well-defined and consistently followed.', workflow: 'selected_workflow' },
        { id: 'wq2', text: 'People have clear visibility into workflow status and priorities.', workflow: 'selected_workflow' },
        { id: 'wq3', text: 'When issues arise, the resolution process is quick and well-understood.', workflow: 'selected_workflow' },
      ],
    }
  }

  // analysis
  return {
    clan: Math.round(30 + Math.random() * 40),
    adhocracy: Math.round(20 + Math.random() * 30),
    hierarchy: Math.round(40 + Math.random() * 35),
    market: Math.round(35 + Math.random() * 35),
    gaps: [
      'Moderate gap between stated collaboration values and actual competitive behavior patterns.',
      'Innovation culture is below typical benchmarks — may need targeted change management.',
      'Strong process orientation supports systematic improvement but may resist rapid experimentation.',
    ],
    summary: 'The organization shows a balanced profile with a slight lean toward Hierarchy-Market culture. Process discipline is a strength, but Adhocracy scores suggest room for increasing innovation and experimentation.',
  }
}
