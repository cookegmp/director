import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppShell from '@/components/layout/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import IntakePage from '@/pages/IntakePage';
import IdeasListPage from '@/pages/IdeasListPage';
import IdeaDetailPage from '@/pages/IdeaDetailPage';
import ChartersListPage from '@/pages/ChartersListPage';
import CharterViewPage from '@/pages/CharterViewPage';
import IssuesPage from '@/pages/IssuesPage';
import ScaffoldingPage from '@/pages/ScaffoldingPage';
import { useIdeasStore } from '@/stores/ideas';
import { useChartersStore } from '@/stores/charters';
import { useIssuesStore } from '@/stores/issues';
import { useActivityStore } from '@/stores/activity';
import { useScaffoldingStore } from '@/stores/scaffolding';
import { useAgentSessionsStore } from '@/stores/agent-sessions';
import {
  sampleIdeas,
  sampleCharters,
  sampleIssues,
  sampleActivities,
  sampleScaffolding,
  sampleAgentSessions,
} from '@/lib/sample-data';

// Increment this when the data model changes shape to force a re-seed
const DATA_VERSION = 3;
const VERSION_KEY = 'stagemanager-data-version';

function SeedData() {
  useEffect(() => {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const currentVersion = parseInt(storedVersion ?? '0', 10);

    // If version mismatch, clear all stores and re-seed
    if (currentVersion < DATA_VERSION) {
      localStorage.removeItem('stagemanager-ideas');
      localStorage.removeItem('stagemanager-charters');
      localStorage.removeItem('stagemanager-issues');
      localStorage.removeItem('stagemanager-activity');
      localStorage.removeItem('stagemanager-scaffolding');
      localStorage.removeItem('stagemanager-agent-sessions');

      useIdeasStore.setState({ ideas: sampleIdeas });
      useChartersStore.setState({ charters: sampleCharters });
      useIssuesStore.setState({ issues: sampleIssues });
      useActivityStore.setState({ activities: sampleActivities });
      useScaffoldingStore.getState().setDocuments(sampleScaffolding);
      useAgentSessionsStore.setState({ sessions: sampleAgentSessions });

      localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
      return;
    }

    // Only seed if all stores are empty (fresh browser)
    const ideas = useIdeasStore.getState().ideas;
    const charters = useChartersStore.getState().charters;
    const issues = useIssuesStore.getState().issues;
    const activities = useActivityStore.getState().activities;
    const scaffolding = useScaffoldingStore.getState().documents;

    if (
      ideas.length === 0 &&
      charters.length === 0 &&
      issues.length === 0 &&
      activities.length === 0 &&
      scaffolding.length === 0
    ) {
      useIdeasStore.setState({ ideas: sampleIdeas });
      useChartersStore.setState({ charters: sampleCharters });
      useIssuesStore.setState({ issues: sampleIssues });
      useActivityStore.setState({ activities: sampleActivities });
      useScaffoldingStore.getState().setDocuments(sampleScaffolding);
      useAgentSessionsStore.setState({ sessions: sampleAgentSessions });

      localStorage.setItem(VERSION_KEY, String(DATA_VERSION));
    }
  }, []);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <SeedData />
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new" element={<IntakePage />} />
            <Route path="/ideas" element={<IdeasListPage />} />
            <Route path="/ideas/:id" element={<IdeaDetailPage />} />
            <Route path="/charters" element={<ChartersListPage />} />
            <Route path="/charters/:id" element={<CharterViewPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/scaffolding" element={<ScaffoldingPage />} />
          </Route>
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
