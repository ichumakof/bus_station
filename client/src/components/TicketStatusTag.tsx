import { Tag } from 'antd';
import type { TicketStatus } from '../api/tickets';

/** Показывает статус билета в таблицах и карточках. */
export default function TicketStatusTag({ status }: { status: TicketStatus }) {
  if (status === 'Cancelled') {
    return <Tag color="red">Отменен</Tag>;
  }

  return <Tag color="blue">Куплен</Tag>;
}
