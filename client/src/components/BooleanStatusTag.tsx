import { Tag } from 'antd';

/** Показывает логический статус компактным цветным тегом. */
export default function BooleanStatusTag({ value }: { value: boolean }) {
  if (value) {
    return <Tag color="green">Р”Р°</Tag>;
  }

  return <Tag color="red">РќРµС‚</Tag>;
}
