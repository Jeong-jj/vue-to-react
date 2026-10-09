<script setup lang="ts">
import ItemCard from './ItemCard.vue'
import type { Property } from '../types'

defineProps<{
  items: Property[]
  selectedId: number | null
}>()

const emit = defineEmits<{
  select: [id: number]
}>()
</script>

<template>
  <p v-if="items.length === 0">검색 결과가 없습니다</p>
  <ul v-else>
    <ItemCard
      v-for="item in items"
      :key="item.id"
      :item="item"
      :selected="item.id === selectedId"
      @click="emit('select', item.id)"
    />
  </ul>
</template>
