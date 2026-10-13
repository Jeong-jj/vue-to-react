import { CATEGORY_LABEL, type Property } from '../../day02/types'
import { FavoriteButton } from './FavoriteButton'

interface Props {
  property: Property
  selected: boolean
  favorite: boolean
  deleting: boolean
  onSelect: (id: number) => void
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
}

export function PropertyItem({
  property,
  selected,
  favorite,
  deleting,
  onSelect,
  onToggleFavorite,
  onDelete,
}: Props) {
  return (
    <li>
      <button type="button" onClick={() => onSelect(property.id)} aria-pressed={selected}>
        {selected && '▶ '}
        <strong>{property.title}</strong> · {CATEGORY_LABEL[property.category]} · 보증금{' '}
        {property.deposit} / 월세 {property.monthlyRent} (만원)
      </button>
      <FavoriteButton active={favorite} onToggle={() => onToggleFavorite(property.id)} />
      <button type="button" onClick={() => onDelete(property.id)} disabled={deleting}>
        {deleting ? '삭제 중...' : '삭제'}
      </button>
    </li>
  )
}
