import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Alert, Button, Descriptions, Form, Input, Typography, message } from 'antd';
import { formatDateTime, formatDuration } from '../app/format';
import { ApiError } from '../api/client';
import { ticketsApi } from '../api/tickets';
import { tripsApi } from '../api/trips';
import { useAuth } from '../contexts/AuthContext';
import PageError from '../components/PageError';
import PageLoading from '../components/PageLoading';
import PageNotFound from '../components/PageNotFound';
import TripStatusTag from '../components/TripStatusTag';

const { Title } = Typography;

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: trip, isLoading, isError, error } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripsApi.getById(Number(id)),
    enabled: Boolean(id),
  });

  const purchaseMutation = useMutation({
    mutationFn: (passengerName: string) =>
      ticketsApi.create({ tripId: Number(id), passengerName }),
    onSuccess: () => {
      void messageApi.success('Билет успешно куплен');
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ['trip', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
    onError: (err) => {
      setServerError(err instanceof ApiError ? err.message : 'Не удалось купить билет.');
    },
  });

  if (isLoading) return <PageLoading />;
  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return <PageNotFound />;
    }
    return <PageError message={error instanceof ApiError ? error.message : undefined} />;
  }
  if (!trip) return <PageNotFound />;

  return (
    <>
      {contextHolder}

      <Title level={4} style={{ marginTop: 0 }}>
        {trip.route.departureCity} - {trip.route.arrivalCity}
      </Title>

      {serverError && (
        <Alert
          type="error"
          message={serverError}
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setServerError(null)}
        />
      )}

      <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Маршрут">
          {trip.route.departureCity} - {trip.route.arrivalCity}
        </Descriptions.Item>
        <Descriptions.Item label="Отправление">{formatDateTime(trip.departureTime)}</Descriptions.Item>
        <Descriptions.Item label="Прибытие">{formatDateTime(trip.arrivalTime)}</Descriptions.Item>
        <Descriptions.Item label="В пути">{formatDuration(trip.route.travelMinutes)}</Descriptions.Item>
        <Descriptions.Item label="Цена">{trip.price} ₽</Descriptions.Item>
        <Descriptions.Item label="Всего мест">{trip.totalSeats}</Descriptions.Item>
        <Descriptions.Item label="Свободно мест">{trip.freeSeats}</Descriptions.Item>
        <Descriptions.Item label="Статус">
          <TripStatusTag status={trip.status} />
        </Descriptions.Item>
      </Descriptions>

      {role === 'Customer' && trip.status === 'Scheduled' && trip.freeSeats > 0 && (
        <>
          <Title level={5}>Покупка билета</Title>
          <Form
            layout="vertical"
            style={{ maxWidth: 420 }}
            onFinish={(values: { passengerName: string }) =>
              purchaseMutation.mutate(values.passengerName)
            }
            disabled={purchaseMutation.isPending}
          >
            <Form.Item
              name="passengerName"
              label="ФИО пассажира"
              rules={[{ required: true, message: 'Введите имя пассажира' }]}
            >
              <Input maxLength={100} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={purchaseMutation.isPending}>
              Купить билет
            </Button>
          </Form>
        </>
      )}
    </>
  );
}
