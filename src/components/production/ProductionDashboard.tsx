import HealthIndicators from './HealthIndicators'
import ProductionIssueFeed from './ProductionIssueFeed'
import CharterReferencePanel from '@/components/dev-portal/CharterReferencePanel'

interface ProductionDashboardProps {
  charterId: string
  projectId: string
}

function ProductionDashboard({ charterId, projectId }: ProductionDashboardProps) {
  return (
    <div className="space-y-6">
      <HealthIndicators projectId={projectId} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionIssueFeed projectId={projectId} />
        <CharterReferencePanel charterId={charterId} />
      </div>
    </div>
  )
}

export default ProductionDashboard
