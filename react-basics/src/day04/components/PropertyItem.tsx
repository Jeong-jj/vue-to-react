import { CATEGORY_LABEL, type Property } from '../../day02/types'

interface Props {
  property: Property
}

export function PropertyItem({ property }: Props) {
  return (
    <li>
      <strong>{property.title}</strong> · {CATEGORY_LABEL[property.category]} · 보증금{' '}
      {property.deposit} / 월세 {property.monthlyRent} (만원)
    </li>
  )
}
