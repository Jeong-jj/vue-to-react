import { useState } from 'react'
import { usePropertiesQuery, type CategoryFilter } from './api/queries'
import { PropertyDetail } from './components/PropertyDetail'
import { PropertyFilters } from './components/PropertyFilters'
import { PropertyList } from './components/PropertyList'

export function PropertyApp() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data } = usePropertiesQuery(category)

  // 검색은 API가 지원하지 않으므로 받은 목록에서 렌더링 중에 거른다
  const normalizedKeyword = keyword.trim().toLowerCase()
  const visibleProperties = (data ?? []).filter((p) =>
    p.title.toLowerCase().includes(normalizedKeyword),
  )

  return (
    <div>
      <h1>임대 매물</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <section style={{ flex: 1 }}>
          <PropertyFilters
            keyword={keyword}
            category={category}
            onKeywordChange={setKeyword}
            onCategoryChange={setCategory}
          />
          <PropertyList
            properties={visibleProperties}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
        <section style={{ flex: 1 }}>
          {selectedId != null && <PropertyDetail id={selectedId} />}
        </section>
      </div>
    </div>
  )
}
