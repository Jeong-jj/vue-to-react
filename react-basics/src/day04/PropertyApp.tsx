import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { setFailMode } from '../day03/api'
import {
  propertyKeys,
  useDeletePropertyMutation,
  usePropertiesQuery,
  type CategoryFilter,
} from './api/queries'
import { PropertyDetail } from './components/PropertyDetail'
import { PropertyFilters, type SortOrder } from './components/PropertyFilters'
import { PropertyList } from './components/PropertyList'
import { QueryError } from './components/QueryError'
import { useDelayedFlag } from './hooks/useDelayedFlag'
import { useFavorites } from './hooks/useFavorites'

export function PropertyApp() {
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('default')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [failMode, setFailModeState] = useState(false)
  const { isFavorite, toggleFavorite } = useFavorites()
  const deleteMutation = useDeletePropertyMutation()
  const { data, isPending, isError, error, isFetching, isPlaceholderData, refetch } =
    usePropertiesQuery(category)
  // 유형 변경 후 이전 목록을 보여주는 동안, 200ms를 넘기면 로딩 중임을 알린다
  const showSwitchingIndicator = useDelayedFlag(isPlaceholderData, 200)

  // 검색, 즐겨찾기, 정렬은 API가 지원하지 않으므로 받은 목록에서 렌더링 중에 계산한다
  // filter가 새 배열을 만들기 때문에 sort가 쿼리 캐시 배열을 직접 바꾸지 않는다
  const normalizedKeyword = keyword.trim().toLowerCase()
  const visibleProperties = (data ?? [])
    .filter(
      (p) =>
        p.title.toLowerCase().includes(normalizedKeyword) && (!favoritesOnly || isFavorite(p.id)),
    )
    .sort((a, b) => {
      if (sortOrder === 'rentAsc') return a.monthlyRent - b.monthlyRent
      if (sortOrder === 'areaDesc') return b.area - a.area
      return 0
    })

  // setFailMode는 모듈 변수라 렌더링에 반영되지 않으므로 체크 상태는 state로 따로 둔다
  const handleFailModeChange = (on: boolean) => {
    setFailMode(on)
    setFailModeState(on)
    // 캐시가 있으면 다시 요청하지 않아 실패가 드러나지 않으므로, 켤 때 무효화해 재요청시킨다
    // 끌 때는 무효화하지 않고 "다시 시도"로 복구한다
    if (on) queryClient.invalidateQueries({ queryKey: propertyKeys.all })
  }

  // 검색어, 유형, 즐겨찾기만 보기, 정렬을 기본값으로 되돌린다 (선택한 매물은 유지)
  const handleResetFilters = () => {
    setKeyword('')
    setCategory('all')
    setFavoritesOnly(false)
    setSortOrder('default')
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('이 매물을 삭제할까요?')) return
    deleteMutation.mutate(id, {
      onSuccess: () => {
        // 삭제한 매물이 선택돼 있었다면 상세를 닫는다
        setSelectedId((prev) => (prev === id ? null : prev))
      },
    })
  }

  let listContent
  if (isPending) {
    listContent = <p>목록을 불러오는 중...</p>
  } else if (isError) {
    listContent = <QueryError error={error} retrying={isFetching} onRetry={() => refetch()} />
  } else if (visibleProperties.length === 0) {
    listContent = <p>조건에 맞는 매물이 없습니다.</p>
  } else {
    listContent = (
      <PropertyList
        properties={visibleProperties}
        selectedId={selectedId}
        deletingId={deleteMutation.isPending ? deleteMutation.variables : null}
        isFavorite={isFavorite}
        onSelect={setSelectedId}
        onToggleFavorite={toggleFavorite}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div>
      <h1>임대 매물</h1>
      <label>
        <input
          type="checkbox"
          checked={failMode}
          onChange={(e) => handleFailModeChange(e.target.checked)}
        />
        실패 모드 (개발용)
      </label>
      <div style={{ display: 'flex', gap: 24 }}>
        <section style={{ flex: 1 }}>
          <PropertyFilters
            keyword={keyword}
            category={category}
            favoritesOnly={favoritesOnly}
            sortOrder={sortOrder}
            onKeywordChange={setKeyword}
            onCategoryChange={setCategory}
            onFavoritesOnlyChange={setFavoritesOnly}
            onSortOrderChange={setSortOrder}
            onReset={handleResetFilters}
          />
          {deleteMutation.isError && (
            <p role="alert">삭제에 실패했습니다: {deleteMutation.error.message}</p>
          )}
          {showSwitchingIndicator && <p role="status">목록을 불러오는 중...</p>}
          {listContent}
        </section>
        <section style={{ flex: 1 }}>
          {selectedId == null ? (
            <p>매물을 선택하면 상세 정보가 표시됩니다.</p>
          ) : (
            <PropertyDetail
              id={selectedId}
              favorite={isFavorite(selectedId)}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </section>
      </div>
    </div>
  )
}
