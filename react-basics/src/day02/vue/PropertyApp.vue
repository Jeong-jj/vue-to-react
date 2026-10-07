<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SearchInput from './SearchInput.vue'
import CategoryFilter from './CategoryFilter.vue'
import ItemList from './ItemList.vue'
import ItemDetail from './ItemDetail.vue'
import { useEscapeKey } from './useEscapeKey'
import { properties } from '../data'
import type { Category } from '../types'

const keyword = ref('')
const category = ref<Category | 'all'>('all')
const selectedId = ref<number | null>(null)

const filteredItems = computed(() => {
  const q = keyword.value.trim()
  return properties.filter(
    (p) =>
      (category.value === 'all' || p.category === category.value) &&
      p.title.includes(q),
  )
})

const selectedItem = computed(
  () => properties.find((p) => p.id === selectedId.value) ?? null,
)

// 카테고리가 바뀌면 선택 해제
watch(category, () => {
  selectedId.value = null
})

// ESC로 상세 닫기
useEscapeKey(() => {
  selectedId.value = null
})
</script>

<template>
  <div>
    <h1>매물 검색</h1>

    <SearchInput v-model="keyword" />
    <CategoryFilter :selected="category" @change="category = $event" />

    <p>{{ filteredItems.length }}건</p>

    <ItemList
      :items="filteredItems"
      :selected-id="selectedId"
      @select="selectedId = $event"
    />

    <ItemDetail v-if="selectedItem" :item="selectedItem">
      <button type="button" @click="selectedId = null">닫기</button>
    </ItemDetail>
    <p v-else>매물을 선택하세요</p>
  </div>
</template>
