import { RequestsBoard } from "@/pages/requests/RequestsBoard"

export function ClusterRequestsPage() {
  return (
    <RequestsBoard
      targetType="cluster"
      title="Cluster Request Management"
      description="Review, approve, and track requests for new cluster capacity."
    />
  )
}
