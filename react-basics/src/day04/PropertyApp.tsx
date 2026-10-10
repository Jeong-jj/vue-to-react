import { usePropertiesQuery } from './api/queries'
import { PropertyList } from './components/PropertyList'

export function PropertyApp() {
  const { data } = usePropertiesQuery('all')

  return (
    <div>
      <h1>임대 매물</h1>
      <PropertyList properties={data ?? []} />
    </div>
  )
}
