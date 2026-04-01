// AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/Dashboardpage";
import ProtectedRoute from "../features/auth/components/ProtectedRoute";
import MainLayout from "../features/auth/components/MainLayout";
import RecordingsPage from "../features/recordings/pages/Recordingspage";
import ConfigurationCampagnesPage from "../features/Configuration/Campagnes/pages/ConfigurationCampagnesPage";
import AgentTeamSettingsPage from "../features/Configuration/AgentTeamConfig/pages/AgentTeamSettingsPage";
import NotificationSettingPage from "../features/Configuration/AgentMailConfig/pages/NotificationSettingPage";
import PublicRoute from "../features/auth/components/PublicRoute";
import StatisticsPage from "../features/statistics/StatisticsPage";
const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* -------------------- */}
        {/* ROUTE PUBLIQUE LOGIN */}
        {/* -------------------- */}
        <Route element={<PublicRoute />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        {/* -------------------- */}
        {/* REDIRECTION RACINE */}
        {/* -------------------- */}
        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} replace />} />

        {/* -------------------- */}
        {/* ROUTES PROTEGÉES */}
        {/* -------------------- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.RECORDINGS} element={<RecordingsPage />} />
            <Route path={ROUTES.CONFIGURATION_AGENTS_DETAILS} element={<NotificationSettingPage />} />
            <Route path={ROUTES.CONFIGURATION_CAMPAIGNS} element={<ConfigurationCampagnesPage />} />
            <Route path={ROUTES.CONFIGURATION_AGENTS} element={<AgentTeamSettingsPage />} />
            <Route path={ROUTES.CONFIGURATION_AGENTS_DETAILS} element={<NotificationSettingPage />} />
            <Route path={ROUTES.STATISTICS} element={<StatisticsPage />} />
          </Route>
        </Route>

        {/* -------------------- */}
        {/* FALLBACK */}
        {/* -------------------- */}
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;