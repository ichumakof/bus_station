import { apiClient, buildQuery } from './client';

export type TicketStatus = 'Booked' | 'Cancelled';

export interface TicketRoute {
  id: number;
  departureCity: string;
  arrivalCity: string;
  travelMinutes: number;
  isActive: boolean;
}

export interface TicketTrip {
  id: number;
  route: TicketRoute;
  departureTime: string;
  arrivalTime: string;
}

export interface TicketResponse {
  id: number;
  passengerName: string;
  seatNumber: number;
  price: number;
  bookedAt: string;
  status: TicketStatus;
  trip: TicketTrip;
}

export interface CreateTicketRequest {
  tripId: number;
  passengerName: string;
}

export interface SalesReportItemResponse extends TicketResponse {
  customerName: string;
  customerEmail: string;
}

export interface SalesReportResponse {
  totalTickets: number;
  totalRevenue: number;
  items: SalesReportItemResponse[];
}

/** Работает с покупкой билетов и отчетом по продажам. */
export const ticketsApi = {
  my: () => apiClient.get<TicketResponse[]>('/api/tickets/my'),
  create: (data: CreateTicketRequest) => apiClient.post<TicketResponse>('/api/tickets', data),
  sales: (dateFrom?: string, dateTo?: string, routeId?: number) =>
    apiClient.get<SalesReportResponse>(`/api/tickets/sales${buildQuery({ dateFrom, dateTo, routeId })}`),
};
