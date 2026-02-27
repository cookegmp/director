// ============================================================================
// Issue Reporter — Mock Data
// ============================================================================
// Pre-recorded AI conversations for demo mode without an API key.
// ============================================================================

import type { AIResponse, ConversationMessage } from '../types'

// --- Mock Bug Conversation ---
const BUG_CONVERSATION: AIResponse[] = [
  {
    done: false,
    question: 'Which application or project is this about?',
    suggestions: [
      'Shop Floor Tracker',
      'Document Search Portal',
      'Spec Analysis Tool',
      'StageManager itself',
    ],
    helper_text: "Select the application you're experiencing an issue with.",
  },
  {
    done: false,
    question:
      "Can you describe what's happening? What did you expect to see versus what actually occurred?",
    suggestions: [
      'The page crashes or freezes',
      "Data isn't saving correctly",
      'Something displays incorrectly',
      'I get an error message',
      "It's running very slowly",
    ],
    helper_text: undefined,
  },
  {
    done: false,
    question:
      'How often does this happen? Is it every time you perform this action, or only sometimes?',
    suggestions: [
      'Every time',
      'Most of the time',
      'Occasionally',
      'It happened once',
      "I'm not sure",
    ],
    helper_text: undefined,
  },
  {
    done: false,
    question:
      'Can you walk me through the steps that lead to this problem? What were you doing right before it happened?',
    suggestions: [
      'I was navigating between pages',
      'I was submitting a form',
      'I was loading the dashboard',
      'It happens on initial page load',
    ],
    helper_text: 'The more specific you can be, the faster the team can reproduce and fix it.',
  },
  {
    done: true,
    classification: 'bug',
    title: 'Dashboard fails to load when filtering by date range',
    description:
      'The production dashboard crashes with a white screen when applying a custom date range filter. The issue occurs consistently when selecting date ranges spanning more than 30 days. The browser console shows an unhandled promise rejection related to the data fetching query.',
    severity: 'high',
    steps_to_reproduce: [
      'Navigate to the production dashboard',
      'Click the date range filter',
      'Select a start date more than 30 days ago',
      'Click Apply',
      'The page goes white with no error message displayed to the user',
    ],
    expected_behavior:
      'The dashboard should load and display filtered results for the selected date range, or show an appropriate message if the range is too large.',
    actual_behavior:
      'The page crashes with a white screen. The browser console shows "Unhandled Promise Rejection: RangeError: Maximum call stack size exceeded" which suggests a recursive rendering issue with the chart component.',
    desired_outcome: null,
    affected_area: 'Production Dashboard — Date Range Filter',
    potential_duplicates: [
      {
        issueId: 'issue-003',
        title: 'Dashboard load time exceeds 10 seconds with 200+ active jobs',
        similarity_reason:
          'Both issues involve dashboard performance under heavy data loads. The date range filter may be triggering the same underlying query performance problem.',
      },
    ],
    conversation_summary:
      'User reported the production dashboard crashes when applying date range filters spanning 30+ days. The issue is reproducible every time. Classified as a high-severity bug due to complete loss of dashboard functionality. Potential duplicate with existing performance issue #issue-003.',
  },
]

// --- Mock Feature Conversation ---
const FEATURE_CONVERSATION: AIResponse[] = [
  {
    done: false,
    question: 'Which application or project is this about?',
    suggestions: [
      'Shop Floor Tracker',
      'Document Search Portal',
      'Spec Analysis Tool',
      'StageManager itself',
    ],
    helper_text: "Select the application you'd like to see improved.",
  },
  {
    done: false,
    question: "What would you like to be able to do that you can't do today?",
    suggestions: [
      'Export data in a new format',
      'Add a new view or dashboard',
      'Automate a manual process',
      'Integrate with another system',
    ],
    helper_text: undefined,
  },
  {
    done: false,
    question: 'How many people would benefit from this, and how often would they use it?',
    suggestions: [
      'The whole team, daily',
      'A few people, weekly',
      'Management, monthly',
      'Just me, but frequently',
    ],
    helper_text: 'This helps us prioritize the request.',
  },
  {
    done: true,
    classification: 'feature',
    title: 'Add bulk export of job operation history as CSV',
    description:
      'Production managers need the ability to export job operation completion history in CSV format for use in spreadsheet-based analysis and reporting. Currently, data can only be viewed on the dashboard but not extracted for offline analysis or integration with other tools.',
    severity: 'medium',
    steps_to_reproduce: null,
    expected_behavior: null,
    actual_behavior: null,
    desired_outcome:
      'A "Export to CSV" button on the job operations history view that downloads all visible (filtered) records as a CSV file. The export should include job number, operation, operator, completion time, and duration. Date range and machine filters should apply to the export.',
    affected_area: 'Job Operations History View',
    potential_duplicates: [],
    conversation_summary:
      "User requested CSV export capability for job operation history data. The whole production management team would use this weekly for reporting. Classified as a medium-severity feature request — the team has a workaround (manual data entry) but it's time-consuming.",
  },
]

// --- Mock Duplicate-Detected Conversation ---
const DUPLICATE_CONVERSATION: AIResponse[] = [
  {
    done: false,
    question: 'Which application or project is this about?',
    suggestions: [
      'Shop Floor Tracker',
      'Document Search Portal',
      'Spec Analysis Tool',
      'StageManager itself',
    ],
    helper_text: undefined,
  },
  {
    done: false,
    question:
      'I see this is about the Shop Floor Tracker. What specific issue are you experiencing?',
    suggestions: [
      'Jobs display incorrectly',
      'Operations are duplicated',
      "Data doesn't sync from Epicor",
      'Performance is slow',
    ],
    helper_text: undefined,
  },
  {
    done: false,
    question:
      "That sounds like it could be related to an existing issue we're tracking about duplicate operations for split jobs. Can you tell me more about what you're seeing? Are there extra operations showing up that don't belong to your job split?",
    suggestions: [
      'Yes, exactly — duplicate operations',
      "No, it's different from that",
      "I'm not sure what split jobs means",
    ],
    helper_text: 'We have an existing bug report about split job operations showing duplicates.',
  },
  {
    done: true,
    classification: 'bug',
    title: 'Split job operations appearing in wrong job view',
    description:
      "When jobs are split in Epicor (e.g., 12345.1 and 12345.2), operations from sibling splits appear under the wrong job in the Shop Floor Tracker operator view. This causes operators to see operations that aren't assigned to their specific job split.",
    severity: 'high',
    steps_to_reproduce: [
      'Look up a job that has been split in Epicor (any .1 / .2 split)',
      'Open the operator view for one of the splits',
      'Notice that operations from the sibling split also appear in the list',
    ],
    expected_behavior:
      'Only operations belonging to the specific job split should appear in the operator view.',
    actual_behavior:
      'Operations from sibling job splits (same base job number, different split suffix) appear intermingled in the view.',
    desired_outcome: null,
    affected_area: 'Shop Floor Tracker — Operator Job View',
    potential_duplicates: [
      {
        issueId: 'issue-001',
        title: 'Epicor job import shows duplicate operations for split jobs',
        similarity_reason:
          'This appears to be the same root cause — the data import query is not filtering by AssemblySeq, causing split job operations to merge.',
      },
    ],
    conversation_summary:
      'User reported duplicate operations in the Shop Floor Tracker operator view for split jobs. This is very likely the same issue as existing bug #issue-001 about Epicor job import. The AI surfaced the potential duplicate during conversation and the user confirmed it sounds like the same problem.',
  },
]

const CONVERSATIONS = [BUG_CONVERSATION, FEATURE_CONVERSATION, DUPLICATE_CONVERSATION]

export function getMockResponse(
  history: ConversationMessage[],
  _projectId: string | null,
): AIResponse {
  // Count user messages to determine which step we're on
  const userMessageCount = history.filter((m) => m.role === 'user').length

  // Pick conversation based on content hints
  let conversationIndex = 0
  if (history.length > 0) {
    const fullText = history
      .map((m) => m.content)
      .join(' ')
      .toLowerCase()
    if (
      fullText.includes('feature') ||
      fullText.includes('export') ||
      fullText.includes('would like') ||
      fullText.includes('add')
    ) {
      conversationIndex = 1
    } else if (
      fullText.includes('duplicate') ||
      fullText.includes('split') ||
      fullText.includes('shop floor')
    ) {
      conversationIndex = 2
    }
  }

  const conversation = CONVERSATIONS[conversationIndex]!

  // Return the response for this step (user messages map to AI responses)
  const stepIndex = userMessageCount
  if (stepIndex >= conversation.length) {
    return conversation[conversation.length - 1]!
  }
  return conversation[stepIndex]!
}

// --- Sample Existing Issues for Seeding ---

export const sampleReportedIssues = [
  // These are seeded separately in the reported-issues store for demo
  // The main issues store (src/stores/issues.ts) already has sample issues
  // that the AI uses for duplicate detection
]
