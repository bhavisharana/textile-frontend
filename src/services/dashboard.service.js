import { http } from "@/utils/http";

export const dashboardService = {
  async getDashboardStats() {
    const response = await http.get('/dashboard/stats');
    return response.data;
  },
};
