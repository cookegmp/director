import type { TranslatedEntryType, CharterPhase } from '@/types';

interface TranslationRule {
  pattern: RegExp;
  summary: (match: RegExpMatchArray) => string;
  type: TranslatedEntryType | ((match: RegExpMatchArray) => TranslatedEntryType);
  category: string;
}

// Pattern-matching translation rules organized by category
const rules: TranslationRule[] = [
  // --- Project Setup ---
  { pattern: /npm install/i, summary: () => 'Installing required components', type: 'progress', category: 'setup' },
  { pattern: /npm ci/i, summary: () => 'Installing locked dependencies', type: 'progress', category: 'setup' },
  { pattern: /yarn install/i, summary: () => 'Installing required components', type: 'progress', category: 'setup' },
  { pattern: /mkdir\s+(.+)/i, summary: (m) => `Setting up project structure: ${simplifyPath(m[1]!)}`, type: 'progress', category: 'setup' },
  { pattern: /Initializing project/i, summary: () => 'Starting project initialization', type: 'milestone', category: 'setup' },
  { pattern: /package\.json/i, summary: () => 'Configuring project metadata', type: 'progress', category: 'setup' },
  { pattern: /tsconfig/i, summary: () => 'Setting up TypeScript configuration', type: 'progress', category: 'setup' },
  { pattern: /vite\.config/i, summary: () => 'Configuring build system', type: 'progress', category: 'setup' },
  { pattern: /tailwind\.config/i, summary: () => 'Configuring styling system', type: 'progress', category: 'setup' },
  { pattern: /\.env/i, summary: () => 'Setting up environment configuration', type: 'progress', category: 'setup' },

  // --- Component Creation ---
  { pattern: /Created?\s+src\/components\/(.+?)\.tsx/i, summary: (m) => `Built the ${componentName(m[1]!)} component`, type: 'milestone', category: 'components' },
  { pattern: /Created?\s+src\/pages\/(.+?)\.tsx/i, summary: (m) => `Created the ${componentName(m[1]!)} page`, type: 'milestone', category: 'components' },
  { pattern: /Created?\s+src\/hooks\/(.+?)\.ts/i, summary: (m) => `Added ${m[1]} hook`, type: 'progress', category: 'components' },
  { pattern: /Created?\s+src\/(.+?)\.tsx?/i, summary: (m) => `Created ${simplifyPath(m[1]!)}`, type: 'progress', category: 'components' },
  { pattern: /Writing\s+(.+?)\.tsx/i, summary: (m) => `Building ${componentName(m[1]!)} view`, type: 'progress', category: 'components' },

  // --- Database & API ---
  { pattern: /CREATE TABLE\s+(\w+)/i, summary: (m) => `Setting up ${m[1]} data storage`, type: 'milestone', category: 'database' },
  { pattern: /schema.*graphql/i, summary: () => 'Defining API schema', type: 'progress', category: 'database' },
  { pattern: /resolver/i, summary: () => 'Connecting API to data layer', type: 'progress', category: 'database' },
  { pattern: /migration/i, summary: () => 'Updating database structure', type: 'progress', category: 'database' },
  { pattern: /seed(ing)?/i, summary: () => 'Loading initial data', type: 'progress', category: 'database' },

  // --- Testing ---
  { pattern: /(\d+)\/(\d+) tests? passed/i, summary: (m) => m[1] === m[2] ? `All ${m[2]} quality checks passed` : `${m[1]} of ${m[2]} tests passed -- some need attention`, type: (m) => m[1] === m[2] ? 'milestone' : 'error', category: 'testing' },
  { pattern: /PASS\s+(.+)/i, summary: (m) => `Tests passing for ${simplifyPath(m[1]!)}`, type: 'progress', category: 'testing' },
  { pattern: /FAIL\s+(.+)/i, summary: (m) => `Test failure in ${simplifyPath(m[1]!)}`, type: 'error', category: 'testing' },
  { pattern: /All tests passed/i, summary: () => 'All quality checks passed', type: 'milestone', category: 'testing' },
  { pattern: /Test suite/i, summary: () => 'Running quality checks', type: 'progress', category: 'testing' },
  { pattern: /lint(ing)?.*pass/i, summary: () => 'Code style checks passed', type: 'progress', category: 'testing' },
  { pattern: /lint(ing)?.*fail/i, summary: () => 'Code style issues detected', type: 'error', category: 'testing' },
  { pattern: /typecheck/i, summary: () => 'Verifying type safety', type: 'progress', category: 'testing' },

  // --- Errors & Recovery ---
  { pattern: /Error:\s*(.+)/i, summary: () => 'Encountered an issue -- working through it', type: 'error', category: 'errors' },
  { pattern: /ERR!/i, summary: () => 'Hit a snag -- investigating', type: 'error', category: 'errors' },
  { pattern: /WARN(ING)?:\s*(.+)/i, summary: () => 'Minor warning -- continuing', type: 'progress', category: 'errors' },
  { pattern: /fix(ed|ing)\s+(.+)/i, summary: (m) => `Fixing: ${m[2]!.slice(0, 60)}`, type: 'recovery', category: 'errors' },
  { pattern: /retry(ing)?/i, summary: () => 'Retrying previous step', type: 'recovery', category: 'errors' },
  { pattern: /resolved/i, summary: () => 'Issue resolved -- moving forward', type: 'recovery', category: 'errors' },

  // --- Deployment / Build ---
  { pattern: /vite build/i, summary: () => 'Building for production', type: 'milestone', category: 'deployment' },
  { pattern: /Build complete/i, summary: () => 'Production build complete', type: 'complete', category: 'deployment' },
  { pattern: /bundle size/i, summary: () => 'Analyzing bundle size', type: 'progress', category: 'deployment' },
  { pattern: /docker build/i, summary: () => 'Preparing container image', type: 'progress', category: 'deployment' },
  { pattern: /Deploying/i, summary: () => 'Deploying to environment', type: 'milestone', category: 'deployment' },
  { pattern: /Successfully deployed/i, summary: () => 'Deployment successful', type: 'complete', category: 'deployment' },

  // --- Git ---
  { pattern: /git init/i, summary: () => 'Initializing version control', type: 'progress', category: 'setup' },
  { pattern: /git commit/i, summary: () => 'Saving progress checkpoint', type: 'progress', category: 'setup' },
  { pattern: /git push/i, summary: () => 'Pushing changes to remote', type: 'progress', category: 'deployment' },
];

// Helper to deal with dynamic type based on match
function getRuleType(rule: TranslationRule, match: RegExpMatchArray): TranslatedEntryType {
  if (typeof rule.type === 'function') {
    return (rule.type as (m: RegExpMatchArray) => TranslatedEntryType)(match);
  }
  return rule.type;
}

function simplifyPath(path: string): string {
  return path.replace(/^(src\/|\.\/)/g, '').replace(/\.(tsx?|jsx?)$/g, '');
}

function componentName(path: string): string {
  const parts = path.split('/');
  const last = parts[parts.length - 1] ?? path;
  return last.replace(/\.(tsx?|jsx?)$/g, '').replace(/([A-Z])/g, ' $1').trim();
}

export interface TranslationResult {
  summary: string;
  type: TranslatedEntryType;
  phase: string;
}

export function translateOutput(line: string, phases: CharterPhase[]): TranslationResult {
  for (const rule of rules) {
    const match = line.match(rule.pattern);
    if (match) {
      return {
        summary: rule.summary(match),
        type: getRuleType(rule, match),
        phase: matchPhase(line, phases),
      };
    }
  }

  // Fallback
  return {
    summary: 'Working...',
    type: 'progress',
    phase: matchPhase(line, phases),
  };
}

function matchPhase(line: string, phases: CharterPhase[]): string {
  const lower = line.toLowerCase();
  let bestScore = 0;
  let bestPhase = 'General';

  for (const phase of phases) {
    let score = 0;
    // Check phase name keywords
    const phaseWords = phase.phase.toLowerCase().split(/\s+/);
    for (const word of phaseWords) {
      if (word.length > 3 && lower.includes(word)) score += 2;
    }
    // Check task keywords
    for (const task of phase.tasks) {
      const taskWords = task.toLowerCase().split(/\s+/);
      for (const word of taskWords) {
        if (word.length > 3 && lower.includes(word)) score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestPhase = phase.phase;
    }
  }

  return bestPhase;
}
