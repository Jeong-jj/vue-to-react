<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { fetchProperties } from '@/lib/api'
import { CATEGORY_LABEL, type Category, type Property } from '@/lib/types'

const route = useRoute()

// 필터 조건은 URL 쿼리(?category=apartment)에 둔다 → 새로고침, 공유, 뒤로 가기에도 유지
const category = computed<Category | 'all'>(() => {
  const value = route.query.category
  return typeof value === 'string' && value in CATEGORY_LABEL ? (value as Category) : 'all'
})

const properties = ref<Property[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    properties.value = await fetchProperties(category.value)
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
}

// 쿼리가 바뀌면 다시 불러온다 (처음 진입 포함)
watch(category, load, { immediate: true })
</script>

<template>
  <h1>매물 목록</h1>

  <nav>
    <RouterLink :to="{ query: {} }">전체</RouterLink>
    <RouterLink
      v-for="(label, key) in CATEGORY_LABEL"
      :key="key"
      :to="{ query: { category: key } }"
    >
      {{ label }}
    </RouterLink>
  </nav>

  <p v-if="loading">목록을 불러오는 중...</p>
  <div v-else-if="error">
    <p>{{ error.message }}</p>
    <button type="button" @click="load">다시 시도</button>
  </div>
  <p v-else-if="properties.length === 0">매물이 없습니다.</p>
  <ul v-else>
    <li v-for="p in properties" :key="p.id">
      <RouterLink :to="`/properties/${p.id}`">
        {{ p.title }} · {{ CATEGORY_LABEL[p.category] }} · {{ p.deposit }} / {{ p.monthlyRent }}
      </RouterLink>
    </li>
  </ul>
</template>
