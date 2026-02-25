import { useNavigate, useSearchParams } from 'react-router-dom';
import IssueReporterWizard from '@/modules/issue-reporter/components/IssueReporterWizard';

function IssueReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('project');

  return (
    <IssueReporterWizard
      projectId={projectId}
      onCancel={() => navigate(-1)}
    />
  );
}

export default IssueReportPage;
