<script setup lang="ts">
import { ref, watch } from 'vue'
import PropertyForm from './PropertyForm.vue'
import {
  useProperties,
  useProperty,
  useCreateProperty,
  useDeleteProperty,
} from './queries'
import { setFailMode, type PropertyInput } from '../api'
import { CATEGORY_LABEL, type Category } from '../../day02/types'

const category = ref<Category | 'all'>('all')
const selectedId = ref<number | null>(null)
const failMode = ref(false)

watch(failMode, (on) => setFailMode(on))

const { data: items, isPending, isError, error, refetch, isFetching } =
  useProperties(category)
const { data: detail, isPending: isDetailPending } = useProperty(selectedId)

const createMutation = useCreateProperty()
const deleteMutation = useDeleteProperty()

function handleCreate(input: PropertyInput, reset: () => void) {
  createMutation.mutate(input, {
    onSuccess: () => reset(),
  })
}

function handleDelete(id: number) {
  deleteMutation.mutate(id, {
    onSuccess: () => {
      if (selectedId.value === id) selectedId.value = null
    },
  })
}
</script>

<template>
  <div>
    <h1>매물 관리</h1>

    <label>
      <input v-model="failMode" type="checkbox" />
      API 실패 모드
    </label>

    <select v-model="category">
      <option value="all">전체</option>
      <option v-for="(label, key) in CATEGORY_LABEL" :key="key" :value="key">
        {{ label }}
      </option>
    </select>
    <span v-if="isFetching && !isPending"> 갱신 중...</span>

    <!-- 목록: loading / error / empty / success -->
    <p v-if="isPending">불러오는 중...</p>
    <div v-else-if="isError">
      <p>{{ error?.message }}</p>
      <button type="button" @click="refetch()">다시 시도</button>
    </div>
    <p v-else-if="items?.length === 0">등록된 매물이 없습니다</p>
    <ul v-else>
      <li v-for="item in items" :key="item.id">
        <button type="button" @click="selectedId = item.id">
          {{ item.title }} ({{ CATEGORY_LABEL[item.category] }})
        </button>
        <button
          type="button"
          :disabled="deleteMutation.isPending.value"
          @click="handleDelete(item.id)"
        >
          삭제
        </button>
      </li>
    </ul>

    <!-- 상세 -->
    <section v-if="selectedId !== null">
      <p v-if="isDetailPending">상세 불러오는 중...</p>
      <template v-else-if="detail">
        <h2>{{ detail.title }}</h2>
        <p>
          {{ detail.deposit.toLocaleString() }} / {{ detail.monthlyRent }} 만원 ·
          {{ detail.area }}㎡
        </p>
        <p>{{ detail.description }}</p>
      </template>
      <button type="button" @click="selectedId = null">닫기</button>
    </section>

    <PropertyForm
      :pending="createMutation.isPending.value"
      :error-message="createMutation.error.value?.message"
      @submit="handleCreate"
    />
  </div>
</template>
