import { useState } from 'react'
import { usePropertiesQuery, type CategoryFilter } from './api/queries'
import { PropertyFilters } from './components/PropertyFilters'
import { PropertyList } from './components/PropertyList'

export function PropertyApp() {
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const { data } = usePropertiesQuery(category)

  // 검색은 API가 지원하지 않으므로 받은 목록에서 렌더링 중에 거른다
  const normalizedKeyword = keyword.trim().toLowerCase()
  const visibleProperties = (data ?? []).filter((p) =>
    p.title.toLowerCase().includes(normalizedKeyword),
  )

  return (
    <div>
      <h1>임대 매물</h1>
      <PropertyFilters
        keyword={keyword}
        category={category}
        onKeywordChange={setKeyword}
        onCategoryChange={setCategory}
      />
      <PropertyList properties={visibleProperties} />
    </div>
  )
}
