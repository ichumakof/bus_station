import { apiClient, buildQuery } from './client';
import type { RouteResponse } from './routes';

export type TripStatus = 'Scheduled' | 'Cancelled';

export interface TripResponse {
  id: number;
  routeId: number;
  route: RouteResponse;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  freeSeats: number;
  status: TripStatus;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TripListParams {
  fromCity?: string;
  toCity?: string;
  date?: string;
  routeId?: number;
  status?: TripStatus;
  page?: number;
  pageSize?: number;
}

export interface TripRequest {
  routeId: number;
  departureTime: string;
  price: number;
  totalSeats: number;
  status: TripStatus;
}

/** Возвращает рейсы с фильтрами и пагинацией. */
export const tripsApi = {
  list: (params: TripListParams = {}) =>
    apiClient.get<PagedResult<TripResponse>>(`/api/trips${buildQuery(params)}`),
  getById: (id: number) => apiClient.get<TripResponse>(`/api/trips/${id}`),
  create: (data: TripRequest) => apiClient.post<TripResponse>('/api/trips', data),
  update: (id: number, data: TripRequest) => apiClient.put<TripResponse>(`/api/trips/${id}`, data),
};
