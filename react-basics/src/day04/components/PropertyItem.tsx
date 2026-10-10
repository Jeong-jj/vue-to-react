import { CATEGORY_LABEL, type Property } from '../../day02/types'

interface Props {
  property: Property
  selected: boolean
  onSelect: (id: number) => void
}

export function PropertyItem({ property, selected, onSelect }: Props) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(property.id)} aria-pressed={selected}>
        {selected && '▶ '}
        <strong>{property.title}</strong> · {CATEGORY_LABEL[property.category]} · 보증금{' '}
        {property.deposit} / 월세 {property.monthlyRent} (만원)
      </button>
    </li>
  )
}
