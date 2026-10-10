import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteProperty, fetchProperties, fetchProperty } from '../../day03/api'
import type { Category } from '../../day02/types'

export type CategoryFilter = Category | 'all'

export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => ['properties', 'list'] as const,
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

export function useDeletePropertyMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: (_, id) => {
      // all을 무효화하면 열려 있는 상세가 재요청되어 "찾을 수 없음" 에러가 나므로 목록만 무효화한다
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() })
      queryClient.removeQueries({ queryKey: propertyKeys.detail(id) })
    },
  })
}
