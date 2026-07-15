import { RequestsBoard } from "@/pages/requests/RequestsBoard"

export function AssetRequestsPage() {
  return (
    <RequestsBoard
      targetType="asset"
      title="Customer Asset Request Management"
      description="Review, approve, and track requests for customer asset allocations."
    />
  )
}
