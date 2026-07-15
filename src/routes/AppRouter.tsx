import * as React from "react"
import { Navigate, Route, Routes } from "react-router-dom"

import { DashboardLayout } from "@/layouts/DashboardLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "./ProtectedRoute"
import { RoleRoute } from "./RoleRoute"
import { PageLoader } from "@/components/common/PageLoader"

const LoginPage = React.lazy(() => import("@/pages/auth/LoginPage").then((m) => ({ default: m.LoginPage })))
const DashboardPage = React.lazy(() => import("@/pages/dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })))
const ClusterListPage = React.lazy(() => import("@/pages/clusters/ClusterListPage").then((m) => ({ default: m.ClusterListPage })))
const ClusterDetailPage = React.lazy(() => import("@/pages/clusters/ClusterDetailPage").then((m) => ({ default: m.ClusterDetailPage })))
const AssetListPage = React.lazy(() => import("@/pages/customer-assets/AssetListPage").then((m) => ({ default: m.AssetListPage })))
const AssetDetailPage = React.lazy(() => import("@/pages/customer-assets/AssetDetailPage").then((m) => ({ default: m.AssetDetailPage })))
const ClusterRequestsPage = React.lazy(() => import("@/pages/cluster-requests/ClusterRequestsPage").then((m) => ({ default: m.ClusterRequestsPage })))
const AssetRequestsPage = React.lazy(() => import("@/pages/asset-requests/AssetRequestsPage").then((m) => ({ default: m.AssetRequestsPage })))
const LiveMonitoringPage = React.lazy(() => import("@/pages/monitoring/LiveMonitoringPage").then((m) => ({ default: m.LiveMonitoringPage })))
const AlertsPage = React.lazy(() => import("@/pages/alerts/AlertsPage").then((m) => ({ default: m.AlertsPage })))
const UserManagementPage = React.lazy(() => import("@/pages/users/UserManagementPage").then((m) => ({ default: m.UserManagementPage })))
const ProfilePage = React.lazy(() => import("@/pages/profile/ProfilePage").then((m) => ({ default: m.ProfilePage })))
const SettingsPage = React.lazy(() => import("@/pages/settings/SettingsPage").then((m) => ({ default: m.SettingsPage })))
const NotFoundPage = React.lazy(() => import("@/pages/errors/NotFoundPage").then((m) => ({ default: m.NotFoundPage })))
const ForbiddenPage = React.lazy(() => import("@/pages/errors/ForbiddenPage").then((m) => ({ default: m.ForbiddenPage })))

function withSuspense(element: React.ReactNode) {
  return <React.Suspense fallback={<PageLoader />}>{element}</React.Suspense>
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={withSuspense(<LoginPage />)} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={withSuspense(<DashboardPage />)} />
          <Route path="/clusters" element={withSuspense(<ClusterListPage />)} />
          <Route path="/clusters/:id" element={withSuspense(<ClusterDetailPage />)} />
          <Route path="/customer-assets" element={withSuspense(<AssetListPage />)} />
          <Route path="/customer-assets/:id" element={withSuspense(<AssetDetailPage />)} />
          <Route path="/cluster-requests" element={withSuspense(<ClusterRequestsPage />)} />
          <Route path="/asset-requests" element={withSuspense(<AssetRequestsPage />)} />
          <Route path="/monitoring" element={withSuspense(<LiveMonitoringPage />)} />
          <Route path="/alerts" element={withSuspense(<AlertsPage />)} />
          <Route element={<RoleRoute allow={["admin"]} />}>
            <Route path="/users" element={withSuspense(<UserManagementPage />)} />
          </Route>
          <Route path="/profile" element={withSuspense(<ProfilePage />)} />
          <Route path="/settings" element={withSuspense(<SettingsPage />)} />
          <Route path="/403" element={withSuspense(<ForbiddenPage />)} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={withSuspense(<NotFoundPage />)} />
    </Routes>
  )
}
