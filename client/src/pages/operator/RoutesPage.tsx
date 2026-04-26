import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Modal, Select, Switch, Table, Typography, message } from 'antd';
import type { TableColumnsType } from 'antd';
import { CITY_OPTIONS } from '../../app/cities';
import { formatDuration } from '../../app/format';
import { ApiError } from '../../api/client';
import { routesApi } from '../../api/routes';
import type { RouteResponse } from '../../api/routes';
import BooleanStatusTag from '../../components/BooleanStatusTag';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';

interface RouteForm {
  departureCity: string;
  arrivalCity: string;
  travelMinutes: number;
  isActive: boolean;
}

export default function RoutesPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteResponse | null>(null);
  const [form] = Form.useForm<RouteForm>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['routes', { includeInactive: true }],
    queryFn: () => routesApi.list(true),
  });

  const createMutation = useMutation({
    mutationFn: (values: RouteForm) => routesApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      messageApi.success('Маршрут создан');
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err) => {
      if (err instanceof ApiError) messageApi.error(err.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: RouteForm }) => routesApi.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      messageApi.success('Маршрут обновлен');
      setModalOpen(false);
      setEditingRoute(null);
      form.resetFields();
    },
    onError: (err) => {
      if (err instanceof ApiError) messageApi.error(err.message);
    },
  });

  const columns: TableColumnsType<RouteResponse> = [
    {
      title: 'Маршрут',
      key: 'route',
      render: (_, record) => `${record.departureCity} - ${record.arrivalCity}`,
    },
    {
      title: 'В пути',
      dataIndex: 'travelMinutes',
      key: 'travelMinutes',
      align: 'center',
      render: (value: number) => formatDuration(value),
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (value: boolean) => <BooleanStatusTag value={value} />,
    },
    {
      title: 'Действия',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Button
          onClick={() => {
            setEditingRoute(record);
            form.setFieldsValue({
              departureCity: record.departureCity,
              arrivalCity: record.arrivalCity,
              travelMinutes: record.travelMinutes,
              isActive: record.isActive,
            });
            setModalOpen(true);
          }}
        >
          Изменить
        </Button>
      ),
    },
  ];

  if (isLoading) return <PageLoading />;
  if (isError) {
    return <PageError message={error instanceof ApiError ? error.message : undefined} />;
  }

  const handleOpenCreate = () => {
    setEditingRoute(null);
    form.setFieldsValue({
      departureCity: 'Иваново',
      arrivalCity: '',
      travelMinutes: 30,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalizedValues = {
        ...values,
        arrivalCity: values.arrivalCity.trim(),
      };

      if (editingRoute) {
        updateMutation.mutate({ id: editingRoute.id, values: normalizedValues });
      } else {
        createMutation.mutate(normalizedValues);
      }
    } catch {
      // validation handled by antd
    }
  };

  return (
    <>
      {contextHolder}

      <Typography.Title level={4} style={{ marginTop: 0 }}>
        Маршруты
      </Typography.Title>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleOpenCreate}>
          Добавить маршрут
        </Button>
      </div>

      {!data || data.length === 0 ? (
        <PageEmpty description="Маршруты отсутствуют" />
      ) : (
        <Table<RouteResponse> dataSource={data} columns={columns} rowKey="id" pagination={false} />
      )}

      <Modal
        title={editingRoute ? 'Изменение маршрута' : 'Новый маршрут'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditingRoute(null);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="departureCity"
            label="Откуда"
            rules={[{ required: true, message: 'Выберите город отправления' }]}
          >
            <Select options={CITY_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="arrivalCity"
            label="Куда"
            rules={[
              { required: true, message: 'Введите город прибытия' },
              { whitespace: true, message: 'Введите город прибытия' },
            ]}
          >
            <Input placeholder="Введите новый город" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="travelMinutes"
            label="Время в пути (минут)"
            rules={[{ required: true, message: 'Введите время в пути' }]}
          >
            <InputNumber min={10} max={600} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Активен" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
