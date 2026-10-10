import type { Property } from '../../day02/types'
import { PropertyItem } from './PropertyItem'

interface Props {
  properties: Property[]
}

export function PropertyList({ properties }: Props) {
  return (
    <ul>
      {properties.map((p) => (
        <PropertyItem key={p.id} property={p} />
      ))}
    </ul>
  )
}
