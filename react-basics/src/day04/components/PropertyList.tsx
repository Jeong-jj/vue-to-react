import type { Property } from '../../day02/types'
import { PropertyItem } from './PropertyItem'

interface Props {
  properties: Property[]
  selectedId: number | null
  isFavorite: (id: number) => boolean
  onSelect: (id: number) => void
  onToggleFavorite: (id: number) => void
}

export function PropertyList({
  properties,
  selectedId,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: Props) {
  return (
    <ul>
      {properties.map((p) => (
        <PropertyItem
          key={p.id}
          property={p}
          selected={p.id === selectedId}
          favorite={isFavorite(p.id)}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </ul>
  )
}
