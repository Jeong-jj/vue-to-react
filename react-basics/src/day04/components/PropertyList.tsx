import type { Property } from '../../day02/types'
import { PropertyItem } from './PropertyItem'

interface Props {
  properties: Property[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function PropertyList({ properties, selectedId, onSelect }: Props) {
  return (
    <ul>
      {properties.map((p) => (
        <PropertyItem
          key={p.id}
          property={p}
          selected={p.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
