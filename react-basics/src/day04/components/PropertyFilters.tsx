import { CATEGORY_LABEL, type Category } from '../../day02/types'
import type { CategoryFilter } from '../api/queries'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({
    value: c,
    label: CATEGORY_LABEL[c],
  })),
]

export type SortOrder = 'default' | 'rentAsc' | 'areaDesc'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'default', label: '기본순' },
  { value: 'rentAsc', label: '월세 낮은 순' },
  { value: 'areaDesc', label: '면적 넓은 순' },
]

interface Props {
  keyword: string
  category: CategoryFilter
  favoritesOnly: boolean
  sortOrder: SortOrder
  onKeywordChange: (keyword: string) => void
  onCategoryChange: (category: CategoryFilter) => void
  onFavoritesOnlyChange: (favoritesOnly: boolean) => void
  onSortOrderChange: (sortOrder: SortOrder) => void
}

export function PropertyFilters({
  keyword,
  category,
  favoritesOnly,
  sortOrder,
  onKeywordChange,
  onCategoryChange,
  onFavoritesOnlyChange,
  onSortOrderChange,
}: Props) {
  return (
    <div>
      <input
        type="search"
        placeholder="매물명 검색"
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />
      {CATEGORY_OPTIONS.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name="category"
            checked={category === option.value}
            onChange={() => onCategoryChange(option.value)}
          />
          {option.label}
        </label>
      ))}
      <label>
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(e) => onFavoritesOnlyChange(e.target.checked)}
        />
        즐겨찾기만 보기
      </label>
      <select value={sortOrder} onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
