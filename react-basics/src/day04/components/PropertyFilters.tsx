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
  onKeywordChange: (keyword: string) => void
  onCategoryChange: (category: CategoryFilter) => void
}

export function PropertyFilters({ keyword, category, onKeywordChange, onCategoryChange }: Props) {
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
    </div>
  )
}
