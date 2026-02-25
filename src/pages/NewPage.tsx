import { useNavigate } from 'react-router-dom';
import { PreFilterCard } from '@/components/shared/wizard';

function NewPage() {
  const navigate = useNavigate();

  return (
    <PreFilterCard
      onSelectIdea={() => navigate('/new/idea')}
      onSelectIssue={() => navigate('/report')}
    />
  );
}

export default NewPage;
