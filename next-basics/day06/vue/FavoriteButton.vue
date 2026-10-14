<script setup lang="ts">
// 상세 화면에 들어갈 즐겨찾기 버튼. 즐겨찾기 id 목록은 localStorage에 저장한다.
import { ref, watch } from 'vue'

const props = defineProps<{ id: number }>()

const STORAGE_KEY = 'favorites'

// Vue SPA는 브라우저에서만 실행되므로 setup에서 바로 localStorage를 읽어도 된다
const ids = ref<number[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))

watch(ids, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

function toggle() {
  ids.value = ids.value.includes(props.id)
    ? ids.value.filter((v) => v !== props.id)
    : [...ids.value, props.id]
}
</script>

<template>
  <button type="button" @click="toggle">
    {{ ids.includes(props.id) ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기' }}
  </button>
</template>
