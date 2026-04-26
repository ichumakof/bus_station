import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Col, Input, Row, Select, Space, Table, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { formatDateTime } from '../../app/format';
import { ApiError } from '../../api/client';
import { routesApi } from '../../api/routes';
import { ticketsApi } from '../../api/tickets';
import type { SalesReportItemResponse } from '../../api/tickets';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';

const columns: TableColumnsType<SalesReportItemResponse> = [
  {
    title: 'Покупатель',
    key: 'customer',
    render: (_, record) => `${record.customerName} (${record.customerEmail})`,
  },
  {
    title: 'Пассажир',
    dataIndex: 'passengerName',
    key: 'passengerName',
  },
  {
    title: 'Маршрут',
    key: 'route',
    render: (_, record) => `${record.trip.route.departureCity} - ${record.trip.route.arrivalCity}`,
  },
  {
    title: 'Отправление',
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
];

function SalesReportPageInner() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [routeId, setRouteId] = useState<number | undefined>(undefined);

  const routesQuery = useQuery({
    queryKey: ['report-routes'],
    queryFn: () => routesApi.list(),
  });

  const reportQuery = useQuery({
    queryKey: ['sales-report', { dateFrom, dateTo, routeId }],
    queryFn: () => ticketsApi.sales(dateFrom || undefined, dateTo || undefined, routeId),
  });

  if (routesQuery.isLoading || reportQuery.isLoading) return <PageLoading />;
  if (routesQuery.isError) {
    return (
      <PageError
        message={routesQuery.error instanceof ApiError ? routesQuery.error.message : undefined}
      />
    );
  }
  if (reportQuery.isError) {
    return (
      <PageError
        message={reportQuery.error instanceof ApiError ? reportQuery.error.message : undefined}
      />
    );
  }

  const routeOptions = (routesQuery.data ?? []).map((route) => ({
    label: `${route.departureCity} - ${route.arrivalCity}`,
    value: route.id,
  }));

  const data = reportQuery.data;

  return (
    <>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Отчет по продажам
      </Typography.Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Все маршруты"
          style={{ width: 300 }}
          options={routeOptions}
          value={routeId}
          onChange={(value) => setRouteId(value)}
        />
        <Input
          type="date"
          style={{ width: 180 }}
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <Input
          type="date"
          style={{ width: 180 }}
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
      </Space>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card>
            <Typography.Text type="secondary">Продано билетов</Typography.Text>
            <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
              {data?.totalTickets ?? 0}
            </Typography.Title>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Typography.Text type="secondary">Сумма продаж</Typography.Text>
            <Typography.Title level={3} style={{ margin: '8px 0 0' }}>
              {data?.totalRevenue ?? 0} ₽
            </Typography.Title>
          </Card>
        </Col>
      </Row>

      {!data || data.items.length === 0 ? (
        <PageEmpty description="Продажи не найдены" />
      ) : (
        <Table<SalesReportItemResponse>
          dataSource={data.items}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      )}
    </>
  );
}

export function SalesReportPage() {
  return <SalesReportPageInner />;
}

export default SalesReportPageInner;
