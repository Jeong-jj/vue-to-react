import { computed, type Ref } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchProperties,
  fetchProperty,
  createProperty,
  deleteProperty,
} from '../api'
import type { Category } from '../../day02/types'

export const propertyKeys = {
  all: ['properties'] as const,
  list: (category: Category | 'all') => [...propertyKeys.all, 'list', category] as const,
  detail: (id: number | null) => [...propertyKeys.all, 'detail', id] as const,
}

export function useProperties(category: Ref<Category | 'all'>) {
  return useQuery({
    queryKey: computed(() => propertyKeys.list(category.value)),
    queryFn: () => fetchProperties(category.value),
    staleTime: 30_000,
  })
}

export function useProperty(id: Ref<number | null>) {
  return useQuery({
    queryKey: computed(() => propertyKeys.detail(id.value)),
    queryFn: () => fetchProperty(id.value!),
    enabled: computed(() => id.value !== null),
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.all })
    },
  })
}
