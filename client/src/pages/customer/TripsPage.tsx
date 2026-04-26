import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input, Select, Space, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { useNavigate } from 'react-router-dom';
import { CITY_OPTIONS } from '../../app/cities';
import { formatDateTime, formatDuration } from '../../app/format';
import { ApiError } from '../../api/client';
import { tripsApi } from '../../api/trips';
import type { TripResponse } from '../../api/trips';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import TripStatusTag from '../../components/TripStatusTag';

const columns: TableColumnsType<TripResponse> = [
  {
    title: 'Маршрут',
    key: 'route',
    render: (_, record) => `${record.route.departureCity} - ${record.route.arrivalCity}`,
  },
  {
    title: 'Отправление',
    dataIndex: 'departureTime',
    key: 'departureTime',
    render: (value: string) => formatDateTime(value),
  },
  {
    title: 'В пути',
    key: 'travelMinutes',
    render: (_, record) => formatDuration(record.route.travelMinutes),
  },
  {
    title: 'Цена',
    dataIndex: 'price',
    key: 'price',
    render: (value: number) => `${value} ₽`,
  },
  {
    title: 'Свободно мест',
    dataIndex: 'freeSeats',
    key: 'freeSeats',
  },
  {
    title: 'Статус',
    dataIndex: 'status',
    key: 'status',
    render: (status: TripResponse['status']) => <TripStatusTag status={status} />,
  },
];

export default function TripsPage() {
  const navigate = useNavigate();
  const [fromCity, setFromCity] = useState<string>('Иваново');
  const [toCity, setToCity] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const queryParams = {
    fromCity,
    toCity,
    date: date || undefined,
    page,
    pageSize,
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['trips', queryParams],
    queryFn: () => tripsApi.list(queryParams),
  });

  if (isLoading) return <PageLoading />;
  if (isError) {
    return <PageError message={error instanceof ApiError ? error.message : undefined} />;
  }

  const trips = data?.items ?? [];

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Поиск рейсов
      </Typography.Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          style={{ width: 180 }}
          value={fromCity}
          options={CITY_OPTIONS}
          onChange={(value) => {
            setFromCity(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Куда"
          style={{ width: 180 }}
          value={toCity}
          options={CITY_OPTIONS.filter((item) => item.value !== fromCity)}
          onChange={(value) => {
            setToCity(value);
            setPage(1);
          }}
        />
        <Input
          type="date"
          style={{ width: 180 }}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
          }}
        />
      </Space>

      {trips.length === 0 ? (
        <PageEmpty description="Рейсы не найдены" />
      ) : (
        <Table<TripResponse>
          dataSource={trips}
          columns={columns}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total: data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/trips/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      )}
    </>
  );
}
