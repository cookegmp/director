import type { DiscoverySessionType } from '@/types'

export interface FlowStep {
  step_id: string
  prompt: string
  suggested_question: string
  extraction_keys: string[]
}

const stakeholder_interview: FlowStep[] = [
  { step_id: 'intro', prompt: 'Begin the stakeholder interview by understanding their role and responsibilities.', suggested_question: 'Can you describe your role and what you\'re responsible for in the organization?', extraction_keys: ['role', 'responsibilities'] },
  { step_id: 'org_structure', prompt: 'Explore the organizational structure and reporting lines.', suggested_question: 'How is your team or department structured? Who do you report to and who reports to you?', extraction_keys: ['org_structure', 'team_size'] },
  { step_id: 'pain_points', prompt: 'Identify the top operational pain points.', suggested_question: 'What are the top three operational challenges you face today?', extraction_keys: ['pain_points', 'challenge_frequency'] },
  { step_id: 'current_tools', prompt: 'Map the current tools and systems in use.', suggested_question: 'What tools, software, or systems do you use daily? Which ones work well and which frustrate you?', extraction_keys: ['current_tools', 'tool_satisfaction'] },
  { step_id: 'key_decisions', prompt: 'Understand key decision-making processes.', suggested_question: 'What are the most important decisions you make in a typical week? What information do you need to make them?', extraction_keys: ['key_decisions', 'information_needs'] },
  { step_id: 'success_metrics', prompt: 'Define what success looks like.', suggested_question: 'If we could solve your biggest challenge, what would success look like? How would you measure it?', extraction_keys: ['success_metrics', 'measurement_criteria'] },
  { step_id: 'org_culture', prompt: 'Explore organizational culture and change readiness.', suggested_question: 'How does your organization typically handle change? What has worked or failed in past technology initiatives?', extraction_keys: ['change_readiness', 'past_initiatives'] },
  { step_id: 'wrap_up', prompt: 'Wrap up and capture any additional insights.', suggested_question: 'Is there anything else we should know that would help us understand your organization better?', extraction_keys: ['additional_context'] },
]

const system_walkthrough: FlowStep[] = [
  { step_id: 'system_overview', prompt: 'Get a high-level overview of all systems.', suggested_question: 'Can you walk us through all the major systems and software your organization uses?', extraction_keys: ['systems_list', 'system_purposes'] },
  { step_id: 'integrations', prompt: 'Map existing integrations between systems.', suggested_question: 'Which of these systems talk to each other? How does data flow between them?', extraction_keys: ['integrations', 'data_flows'] },
  { step_id: 'data_flows', prompt: 'Understand data flow patterns and bottlenecks.', suggested_question: 'Where does data get stuck or delayed? Are there manual steps in the data flow?', extraction_keys: ['data_bottlenecks', 'manual_steps'] },
  { step_id: 'pain_points', prompt: 'Identify system-related pain points.', suggested_question: 'What are the biggest frustrations with your current systems?', extraction_keys: ['system_pain_points', 'workarounds'] },
  { step_id: 'wish_list', prompt: 'Capture the technology wish list.', suggested_question: 'If you could change anything about your technology, what would it be?', extraction_keys: ['wish_list', 'priorities'] },
  { step_id: 'wrap_up', prompt: 'Wrap up the systems walkthrough.', suggested_question: 'Is there any system or process we haven\'t covered that we should know about?', extraction_keys: ['additional_systems'] },
]

const workflow_observation: FlowStep[] = [
  { step_id: 'workflow_name', prompt: 'Identify the workflow being observed.', suggested_question: 'What is the name of this workflow and what is its purpose?', extraction_keys: ['workflow_name', 'workflow_purpose'] },
  { step_id: 'steps', prompt: 'Document each step in the workflow.', suggested_question: 'Walk me through each step from start to finish. What happens at each stage?', extraction_keys: ['workflow_steps', 'step_details'] },
  { step_id: 'decision_points', prompt: 'Identify decision points and branching logic.', suggested_question: 'At which points are decisions made? What determines which path is taken?', extraction_keys: ['decision_points', 'branching_criteria'] },
  { step_id: 'handoff_points', prompt: 'Map handoff points between people or systems.', suggested_question: 'Where does work get handed off between people or departments? How is the handoff communicated?', extraction_keys: ['handoff_points', 'handoff_methods'] },
  { step_id: 'exceptions', prompt: 'Capture exception handling and edge cases.', suggested_question: 'What happens when something goes wrong? How are exceptions or errors handled?', extraction_keys: ['exceptions', 'error_handling'] },
  { step_id: 'improvements', prompt: 'Gather improvement ideas from the people doing the work.', suggested_question: 'If you could change one thing about this workflow, what would it be?', extraction_keys: ['improvement_ideas', 'quick_wins'] },
]

const brand_collection: FlowStep[] = [
  { step_id: 'brand_adjectives', prompt: 'Capture how they describe their brand personality.', suggested_question: 'How would you describe your company\'s brand personality in 3-5 adjectives?', extraction_keys: ['brand_adjectives', 'brand_personality'] },
  { step_id: 'visual_identity', prompt: 'Collect visual identity information.', suggested_question: 'What are your brand colors, fonts, and logo guidelines? Do you have a brand guide?', extraction_keys: ['brand_colors', 'typography', 'logo_guidelines'] },
  { step_id: 'tone', prompt: 'Understand the communication tone.', suggested_question: 'How do you communicate with your customers? What tone do you use in written materials?', extraction_keys: ['communication_tone', 'writing_style'] },
  { step_id: 'competitor_diff', prompt: 'Explore competitive differentiation.', suggested_question: 'How do you differentiate from your competitors? What makes you unique?', extraction_keys: ['differentiators', 'competitor_landscape'] },
  { step_id: 'brand_assets', prompt: 'Inventory existing brand assets.', suggested_question: 'What brand assets do you have today — logos, templates, style guides, marketing materials?', extraction_keys: ['brand_assets', 'asset_locations'] },
]

export const INTERVIEW_FLOWS: Record<DiscoverySessionType, FlowStep[]> = {
  stakeholder_interview,
  system_walkthrough,
  workflow_observation,
  brand_collection,
}
