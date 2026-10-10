import type { Property } from '../../day02/types'
import { PropertyItem } from './PropertyItem'

interface Props {
  properties: Property[]
  selectedId: number | null
  deletingId: number | null
  isFavorite: (id: number) => boolean
  onSelect: (id: number) => void
  onToggleFavorite: (id: number) => void
  onDelete: (id: number) => void
}

export function PropertyList({
  properties,
  selectedId,
  deletingId,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onDelete,
}: Props) {
  return (
    <ul>
      {properties.map((p) => (
        <PropertyItem
          key={p.id}
          property={p}
          selected={p.id === selectedId}
          favorite={isFavorite(p.id)}
          deleting={p.id === deletingId}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
