<script setup lang="ts">
import { CATEGORY_LABEL, type Category } from '../types'

defineProps<{
  selected: Category | 'all'
}>()

const emit = defineEmits<{
  change: [value: Category | 'all']
}>()

const options = [
  { value: 'all', label: '전체' },
  ...(Object.keys(CATEGORY_LABEL) as Category[]).map((key) => ({
    value: key,
    label: CATEGORY_LABEL[key],
  })),
] as { value: Category | 'all'; label: string }[]
</script>

<template>
  <div>
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      :class="{ active: selected === option.value }"
      @click="emit('change', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
