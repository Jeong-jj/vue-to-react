<script setup lang="ts">
// /search: 입력할 때마다 즉시 걸러지는 검색 화면 (vue-query로 전체 목록을 한 번 받아 둔다)
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import type { Property } from '@/lib/types'

const keyword = ref('')

const { data, isPending, isError, refetch } = useQuery({
  queryKey: ['properties', 'all'],
  // 실제 서버 API 호출
  queryFn: async (): Promise<Property[]> => {
    const res = await fetch('/api/properties')
    if (!res.ok) throw new Error('목록을 불러오지 못했습니다')
    return res.json()
  },
})

const results = computed(() =>
  (data.value ?? []).filter((p) => p.title.includes(keyword.value.trim())),
)
</script>

<template>
  <h1>매물 검색</h1>
  <input v-model="keyword" type="search" placeholder="매물명 검색" />

  <p v-if="isPending">불러오는 중...</p>
  <div v-else-if="isError">
    <p>목록을 불러오지 못했습니다.</p>
    <button type="button" @click="refetch()">다시 시도</button>
  </div>
  <p v-else-if="results.length === 0">검색 결과가 없습니다.</p>
  <ul v-else>
    <li v-for="p in results" :key="p.id">
      <RouterLink :to="`/properties/${p.id}`">{{ p.title }}</RouterLink>
    </li>
  </ul>
</template>
