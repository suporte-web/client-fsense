import { apiGet } from '@/lib/api';
import {
  ActivityItem,
  ApiListResponse,
  DashboardFilters,
  DashboardSummary,
  EventItem,
  TeamItem,
  UserProductivity,
  JornadaFilters,
  JornadasResponse,
} from '@/types/dashboard-produtividade';

function dashboardParams(filters?: DashboardFilters) {
  return {
    userId: filters?.userId,
    teamId: filters?.teamId,
    startDate: filters?.startDate,
    endDate: filters?.endDate,
  };
}

function jornadasParams(filters?: JornadaFilters) {
  return {
    userId: filters?.userId,
    name: filters?.name,
    page: filters?.page,
    limit: filters?.limit,
  };
}

export const DashboardProdutividadeService = {
  findSummary: async (
    filters?: DashboardFilters,
  ): Promise<DashboardSummary> => {
    return apiGet<DashboardSummary>('/dashboard-produtividade/summary', {
      params: dashboardParams(filters),
    });
  },

  findUsers: async (
    filters?: DashboardFilters,
  ): Promise<ApiListResponse<UserProductivity>> => {
    return apiGet<ApiListResponse<UserProductivity>>(
      '/dashboard-produtividade/users',
      {
        params: dashboardParams(filters),
      },
    );
  },

  findActivities: async (
    filters?: DashboardFilters,
  ): Promise<ApiListResponse<ActivityItem>> => {
    return apiGet<ApiListResponse<ActivityItem>>(
      '/dashboard-produtividade/activities',
      {
        params: dashboardParams(filters),
      },
    );
  },

  findEvents: async (
    filters?: DashboardFilters,
  ): Promise<ApiListResponse<EventItem>> => {
    return apiGet<ApiListResponse<EventItem>>(
      '/dashboard-produtividade/events',
      {
        params: dashboardParams(filters),
      },
    );
  },

  findTeams: async (): Promise<ApiListResponse<TeamItem>> => {
    return apiGet<ApiListResponse<TeamItem>>('/dashboard-produtividade/teams');
  },

  findJornadas: async (
    filters?: JornadaFilters,
  ): Promise<JornadasResponse> => {
    return apiGet<JornadasResponse>('/dashboard-produtividade/jornadas', {
      params: jornadasParams(filters),
    });
  },
};