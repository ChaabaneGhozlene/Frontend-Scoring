import axiosInstance from '../../services/axiosInstance';
import type { UserDashboardConfig } from './Statistiquetypes';

const BASE = '/dashboard';

export const DashboardService = {
  loadConfig: (userId: number): Promise<UserDashboardConfig> =>
    axiosInstance.get<UserDashboardConfig>(`${BASE}/config/${userId}`).then(r => r.data),

  saveConfig: (config: UserDashboardConfig): Promise<void> =>
    axiosInstance.post(`${BASE}/config`, config).then(() => {}),
};