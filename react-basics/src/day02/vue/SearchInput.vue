<script setup lang="ts">
import { ref, onMounted } from 'vue'

const model = defineModel<string>({ required: true })
const inputRef = ref<HTMLInputElement | null>(null)

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div>
    <input ref="inputRef" v-model="model" placeholder="매물명 검색" />
    <button v-if="model" type="button" @click="model = ''">지우기</button>
  </div>
</template>
