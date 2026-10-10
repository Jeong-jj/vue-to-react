import { useQuery } from '@tanstack/react-query'
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
  })
}

export function usePropertyQuery(id: number | null) {
  return useQuery({
    queryKey: propertyKeys.detail(id ?? -1),
    queryFn: () => fetchProperty(id!),
    enabled: id != null,
  })
}
