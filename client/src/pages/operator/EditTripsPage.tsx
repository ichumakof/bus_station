import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { toDateInputValue, toDateTimeInputValue, formatDateTime } from '../../app/format';
import { ApiError } from '../../api/client';
import { routesApi } from '../../api/routes';
import { tripsApi } from '../../api/trips';
import type { TripResponse, TripStatus } from '../../api/trips';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';
import TripStatusTag from '../../components/TripStatusTag';

interface TripForm {
  routeId: number;
  departureTime: string;
  price: number;
  totalSeats: number;
  status: TripStatus;
}

const statusOptions = [
  { label: 'Запланирован', value: 'Scheduled' },
  { label: 'Отменен', value: 'Cancelled' },
];

export default function EditTripsPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [routeId, setRouteId] = useState<number | undefined>(undefined);
  const [date, setDate] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripResponse | null>(null);
  const [form] = Form.useForm<TripForm>();

  const routesQuery = useQuery({
    queryKey: ['routes', { includeInactive: true }],
    queryFn: () => routesApi.list(true),
  });

  const tripsQuery = useQuery({
    queryKey: ['operator-trips', { routeId, date, page, pageSize }],
    queryFn: () =>
      tripsApi.list({
        routeId,
        date: date || undefined,
        page,
        pageSize,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (values: TripForm) =>
      tripsApi.create({
        routeId: values.routeId,
        departureTime: new Date(values.departureTime).toISOString(),
        price: values.price,
        totalSeats: values.totalSeats,
        status: values.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-trips'] });
      messageApi.success('Рейс создан');
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err) => {
      if (err instanceof ApiError) messageApi.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: TripForm }) =>
      tripsApi.update(id, {
        routeId: values.routeId,
        departureTime: new Date(values.departureTime).toISOString(),
        price: values.price,
        totalSeats: values.totalSeats,
        status: values.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
      messageApi.success('Рейс обновлен');
      setModalOpen(false);
      setEditingTrip(null);
      form.resetFields();
    },
    onError: (err) => {
      if (err instanceof ApiError) messageApi.error(err.message);
    },
  });

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
      render: (status: TripStatus) => <TripStatusTag status={status} />,
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Button
          onClick={() => {
            setEditingTrip(record);
            form.setFieldsValue({
              routeId: record.routeId,
              departureTime: toDateTimeInputValue(record.departureTime),
              price: record.price,
              totalSeats: record.totalSeats,
              status: record.status,
            });
            setModalOpen(true);
          }}
        >
          Изменить
        </Button>
      ),
    },
  ];

  if (routesQuery.isLoading || tripsQuery.isLoading) return <PageLoading />;
  if (routesQuery.isError) {
    return (
      <PageError
        message={routesQuery.error instanceof ApiError ? routesQuery.error.message : undefined}
      />
    );
  }
  if (tripsQuery.isError) {
    return (
      <PageError message={tripsQuery.error instanceof ApiError ? tripsQuery.error.message : undefined} />
    );
  }

  const routeOptions = (routesQuery.data ?? []).map((route) => ({
    label: `${route.departureCity} - ${route.arrivalCity}`,
    value: route.id,
  }));

  const trips = tripsQuery.data?.items ?? [];

  const openCreateModal = () => {
    setEditingTrip(null);
    form.setFieldsValue({
      routeId: routeOptions[0]?.value,
      departureTime: '',
      price: 300,
      totalSeats: 40,
      status: 'Scheduled',
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTrip) {
        updateMutation.mutate({ id: editingTrip.id, values });
      } else {
        createMutation.mutate(values);
      }
    } catch {
      // validation handled by antd
    }
  };

  return (
    <>
      {contextHolder}

      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Рейсы
      </Typography.Title>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          allowClear
          placeholder="Маршрут"
          style={{ width: 260 }}
          options={routeOptions}
          value={routeId}
          onChange={(value) => {
            setRouteId(value);
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
        <Button type="primary" onClick={openCreateModal}>
          Добавить рейс
        </Button>
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
            total: tripsQuery.data?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            },
          }}
        />
      )}

      <Modal
        title={editingTrip ? 'Изменение рейса' : 'Новый рейс'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingTrip(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="routeId"
            label="Маршрут"
            rules={[{ required: true, message: 'Выберите маршрут' }]}
          >
            <Select options={routeOptions} />
          </Form.Item>
          <Form.Item
            name="departureTime"
            label="Дата и время отправления"
            rules={[{ required: true, message: 'Введите дату и время' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Цена"
            rules={[{ required: true, message: 'Введите цену' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="totalSeats"
            label="Количество мест"
            rules={[{ required: true, message: 'Введите количество мест' }]}
          >
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Статус"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
