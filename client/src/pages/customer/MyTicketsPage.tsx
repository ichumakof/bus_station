import { useQuery } from '@tanstack/react-query';
import { Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { formatDateTime } from '../../app/format';
import { ApiError } from '../../api/client';
import { ticketsApi } from '../../api/tickets';
import type { TicketResponse } from '../../api/tickets';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import TicketStatusTag from '../../components/TicketStatusTag';

const columns: TableColumnsType<TicketResponse> = [
  {
    title: 'Маршрут',
    key: 'route',
    render: (_, record) => `${record.trip.route.departureCity} - ${record.trip.route.arrivalCity}`,
  },
  {
    title: 'Пассажир',
    dataIndex: 'passengerName',
    key: 'passengerName',
  },
  {
    title: 'Отправление',
    dataIndex: 'departureTime',
    key: 'departureTime',
    render: (_, record) => formatDateTime(record.trip.departureTime),
  },
  {
    title: 'Место',
    dataIndex: 'seatNumber',
    key: 'seatNumber',
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => `${value} ₽`,
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (status: TicketResponse['status']) => <TicketStatusTag status={status} />,
  },
];

export default function MyTicketsPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: () => ticketsApi.my(),
  });

  if (isLoading) return <PageLoading />;
  if (isError) {
    return <PageError message={error instanceof ApiError ? error.message : undefined} />;
  }

  if (!data || data.length === 0) {
    return <PageEmpty description="У вас пока нет билетов" />;
  }

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Мои билеты
      </Typography.Title>

      <Table<TicketResponse> dataSource={data} columns={columns} rowKey="id" pagination={false} />
    </>
  );
}
