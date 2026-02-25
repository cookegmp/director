import { useNavigate, useSearchParams } from 'react-router-dom';
import IssueReporterWizard from '@/modules/issue-reporter/components/IssueReporterWizard';

function IssueReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');
  const appName = searchParams.get('app');

  return (
    <IssueReporterWizard
      projectId={projectId}
      appName={appName}
      onCancel={() => navigate(-1)}
    />
  );
}

export default IssueReportPage;
