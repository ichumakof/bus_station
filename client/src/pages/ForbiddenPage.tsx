import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="У вас нет доступа к этой странице."
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          Назад
        </Button>
      }
    />
  );
}
