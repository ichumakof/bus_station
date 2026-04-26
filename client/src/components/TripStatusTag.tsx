import { Tag } from 'antd';
import type { TripStatus } from '../api/trips';

/** Показывает статус рейса компактным цветным тегом. */
export default function TripStatusTag({ status }: { status: TripStatus }) {
  if (status === 'Cancelled') {
    return <Tag color="red">Отменен</Tag>;
  }

  return <Tag color="green">Запланирован</Tag>;
}
