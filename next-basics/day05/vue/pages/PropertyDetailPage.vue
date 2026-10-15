<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchProperty } from '@/lib/api'
import { CATEGORY_LABEL, type Property } from '@/lib/types'

// router.ts의 props: true → route.params.id가 prop으로 들어온다 (항상 string)
const props = defineProps<{ id: string }>()

const property = ref<Property | null>(null)
const loading = ref(false)
const notFound = ref(false)

async function load() {
  loading.value = true
  notFound.value = false
  try {
    property.value = await fetchProperty(Number(props.id))
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

watch(() => props.id, load, { immediate: true })
</script>

<template>
  <RouterLink to="/properties">← 목록으로</RouterLink>

  <p v-if="loading">상세 정보를 불러오는 중...</p>
  <p v-else-if="notFound">매물을 찾을 수 없습니다.</p>
  <article v-else-if="property">
    <h1>{{ property.title }}</h1>
    <dl>
      <dt>유형</dt>
      <dd>{{ CATEGORY_LABEL[property.category] }}</dd>
      <dt>보증금 / 월세</dt>
      <dd>{{ property.deposit }} / {{ property.monthlyRent }} (만원)</dd>
      <dt>전용면적</dt>
      <dd>{{ property.area }}㎡</dd>
      <dt>설명</dt>
      <dd>{{ property.description }}</dd>
    </dl>
  </article>
</template>
