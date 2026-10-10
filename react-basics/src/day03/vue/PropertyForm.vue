<script setup lang="ts">
import { reactive } from 'vue'
import { CATEGORY_LABEL, type Category } from '../../day02/types'
import type { PropertyInput } from '../api'

defineProps<{
  pending: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  submit: [input: PropertyInput, reset: () => void]
}>()

const initialForm = (): PropertyInput => ({
  title: '',
  category: 'apartment',
  deposit: 0,
  monthlyRent: 0,
  area: 0,
  description: '',
})

const form = reactive(initialForm())

function reset() {
  Object.assign(form, initialForm())
}

function onSubmit() {
  if (!form.title.trim()) return
  emit('submit', { ...form, title: form.title.trim() }, reset)
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <h2>매물 등록</h2>
    <input v-model="form.title" placeholder="매물명" />
    <select v-model="form.category">
      <option
        v-for="(label, key) in CATEGORY_LABEL"
        :key="key"
        :value="key as Category"
      >
        {{ label }}
      </option>
    </select>
    <input v-model.number="form.deposit" type="number" placeholder="보증금" />
    <input v-model.number="form.monthlyRent" type="number" placeholder="월세" />
    <input v-model.number="form.area" type="number" placeholder="면적" />
    <textarea v-model="form.description" placeholder="설명" />
    <button type="submit" :disabled="pending">
      {{ pending ? '등록 중...' : '등록' }}
    </button>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </form>
</template>
