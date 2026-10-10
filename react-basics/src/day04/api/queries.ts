import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchProperties, fetchProperty } from '../../day03/api'
import type { Category } from '../../day02/types'

export type CategoryFilter = Category | 'all'

export const propertyKeys = {
  all: ['properties'] as const,
  list: (category: CategoryFilter) => ['properties', 'list', category] as const,
  detail: (id: number) => ['properties', 'detail', id] as const,
}

export function usePropertiesQuery(category: CategoryFilter) {
  return useQuery({
    queryKey: propertyKeys.list(category),
    queryFn: () => fetchProperties(category),
    // 유형을 바꿔 새 키를 불러오는 동안 이전 목록을 유지해 로딩 깜빡임을 없앤다
    placeholderData: keepPreviousData,
  })
}

export function usePropertyQuery(id: number) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => fetchProperty(id),
  })
}
