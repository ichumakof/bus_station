import { apiClient, buildQuery } from './client';

export interface RouteResponse {
  id: number;
  departureCity: string;
  arrivalCity: string;
  travelMinutes: number;
  isActive: boolean;
}

export interface RouteRequest {
  departureCity: string;
  arrivalCity: string;
  travelMinutes: number;
  isActive?: boolean;
}

/** Работает с маршрутами автовокзала. */
export const routesApi = {
  list: (includeInactive = false) =>
    apiClient.get<RouteResponse[]>(`/api/routes${buildQuery({ includeInactive })}`),
  create: (data: RouteRequest) => apiClient.post<RouteResponse>('/api/routes', data),
  update: (id: number, data: RouteRequest) => apiClient.put<RouteResponse>(`/api/routes/${id}`, data),
};
