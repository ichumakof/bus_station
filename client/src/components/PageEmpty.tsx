import { Empty } from 'antd';

interface Props {
  description?: string;
}

export default function PageEmpty({ description = 'Нет данных' }: Props) {
  return (
    <div style={{ padding: 48 }}>
      <Empty description={description} />
    </div>
  );
}
