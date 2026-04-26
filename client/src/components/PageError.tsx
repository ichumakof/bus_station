import { Alert } from 'antd';

interface Props {
  message?: string;
}

export default function PageError({ message = 'Произошла ошибка. Попробуйте еще раз.' }: Props) {
  return (
    <div style={{ padding: 48 }}>
      <Alert type="error" message={message} showIcon />
    </div>
  );
}
