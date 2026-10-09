<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_LABEL, type Property } from '../types'

const props = defineProps<{
  item: Property
  selected: boolean
}>()

const priceLabel = computed(
  () => `${props.item.deposit.toLocaleString()} / ${props.item.monthlyRent}`,
)
</script>

<template>
  <!-- 부모에서 단 @click이 루트 요소인 <li>에 자동으로 붙는다 (fallthrough attrs) -->
  <li :class="{ selected }">
    <strong>{{ item.title }}</strong>
    <span>{{ CATEGORY_LABEL[item.category] }}</span>
    <span>{{ priceLabel }}</span>
  </li>
</template>
