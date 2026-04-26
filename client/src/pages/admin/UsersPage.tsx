import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Typography,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import type { FormInstance } from 'antd';
import { ApiError } from '../../api/client';
import { usersApi } from '../../api/users';
import type { CreateUserRequest, UserResponse } from '../../api/users';
import PageEmpty from '../../components/PageEmpty';
import PageError from '../../components/PageError';
import PageLoading from '../../components/PageLoading';

const roles = ['Customer', 'Operator', 'Admin'] as const;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();
  const [localRoles, setLocalRoles] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<CreateUserRequest>();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateUserRequest) => usersApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      messageApi.success('Пользователь добавлен');
      setModalOpen(false);
      form.resetFields();
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        messageApi.error(err.message);
      }
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => usersApi.updateRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      messageApi.success('Роль обновлена');
      setLocalRoles((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        messageApi.error(err.message);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      messageApi.success('Пользователь удален');
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        messageApi.error(err.message);
      }
    },
  });

  const columns: TableColumnsType<UserResponse> = [
    {
      title: 'Имя',
      dataIndex: 'displayName',
      key: 'displayName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роль',
      key: 'role',
      render: (_, record) => {
        const selectedRole = localRoles[record.id] ?? record.role;
        const pending = updateRoleMutation.isPending && updateRoleMutation.variables?.id === record.id;

        return (
          <Space wrap>
            <Select
              value={selectedRole}
              options={roles.map((role) => ({ value: role, label: role }))}
              style={{ width: 150 }}
              disabled={pending}
              onChange={(value) => setLocalRoles((prev) => ({ ...prev, [record.id]: value }))}
            />
            <Button
              type="primary"
              loading={pending}
              disabled={pending || selectedRole === record.role}
              onClick={() => updateRoleMutation.mutate({ id: record.id, role: selectedRole })}
            >
              Сохранить
            </Button>
          </Space>
        );
      },
    },
    {
      title: 'Удаление',
      key: 'delete',
      width: 140,
      render: (_, record) => {
        const pending = deleteMutation.isPending && deleteMutation.variables === record.id;

        return (
          <Popconfirm
            title="Удалить пользователя?"
            description="Связанные билеты тоже будут удалены."
            okText="Удалить"
            cancelText="Отмена"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button danger loading={pending}>
              Удалить
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createMutation.mutate(values);
    } catch {
      // validation handled by antd
    }
  };

  if (isLoading) return <PageLoading />;
  if (isError) {
    return <PageError message={error instanceof ApiError ? error.message : undefined} />;
  }
  if (!data || data.length === 0) {
    return (
      <>
        {contextHolder}

        <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Пользователи
          </Typography.Title>
          <Button type="primary" onClick={() => setModalOpen(true)}>
            Добавить пользователя
          </Button>
        </Space>

        <PageEmpty description="Пользователи не найдены" />
        <Modal
          title="Новый пользователь"
          open={modalOpen}
          onOk={handleCreate}
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
          }}
          confirmLoading={createMutation.isPending}
          destroyOnHidden
        >
          <UserForm form={form} />
        </Modal>
      </>
    );
  }

  return (
    <>
      {contextHolder}

      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }} wrap>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Пользователи
        </Typography.Title>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          Добавить пользователя
        </Button>
      </Space>

      <Table<UserResponse> dataSource={data} columns={columns} rowKey="id" pagination={false} />
      <Typography.Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
        Новая роль начнет действовать после следующего входа пользователя в систему.
      </Typography.Text>

      <Modal
        title="Новый пользователь"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
        destroyOnHidden
      >
        <UserForm form={form} />
      </Modal>
    </>
  );
}

function UserForm({ form }: { form: FormInstance<CreateUserRequest> }) {
  return (
    <Form form={form} layout="vertical" initialValues={{ role: 'Customer' }}>
      <Form.Item
        name="displayName"
        label="Имя"
        rules={[{ required: true, message: 'Введите имя пользователя' }]}
      >
        <Input placeholder="Например, Иван Петров" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Введите email' },
          { type: 'email', message: 'Введите корректный email' },
        ]}
      >
        <Input placeholder="user@example.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Пароль"
        rules={[
          { required: true, message: 'Введите пароль' },
          { min: 6, message: 'Минимум 6 символов' },
        ]}
      >
        <Input.Password placeholder="Не менее 6 символов" />
      </Form.Item>

      <Form.Item
        name="role"
        label="Роль"
        rules={[{ required: true, message: 'Выберите роль' }]}
      >
        <Select options={roles.map((role) => ({ value: role, label: role }))} />
      </Form.Item>
    </Form>
  );
}
