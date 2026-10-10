import { CATEGORY_LABEL, type Category } from '../../day02/types'
import type { CategoryFilter } from '../api/queries'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  ...(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({
    value: c,
    label: CATEGORY_LABEL[c],
  })),
]

interface Props {
  keyword: string
  category: CategoryFilter
  favoritesOnly: boolean
  onKeywordChange: (keyword: string) => void
  onCategoryChange: (category: CategoryFilter) => void
  onFavoritesOnlyChange: (favoritesOnly: boolean) => void
}

export function PropertyFilters({
  keyword,
  category,
  favoritesOnly,
  onKeywordChange,
  onCategoryChange,
  onFavoritesOnlyChange,
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
    </div>
  )
}
