<script setup lang="ts">
import { CATEGORY_LABEL, type Property } from '../types'

defineProps<{
  item: Property
}>()
</script>

<template>
  <section>
    <h2>{{ item.title }}</h2>
    <dl>
      <dt>유형</dt>
      <dd>{{ CATEGORY_LABEL[item.category] }}</dd>
      <dt>보증금 / 월세</dt>
      <dd>{{ item.deposit.toLocaleString() }} / {{ item.monthlyRent }} 만원</dd>
      <dt>전용면적</dt>
      <dd>{{ item.area }}㎡</dd>
    </dl>
    <p>{{ item.description }}</p>
    <slot />
  </section>
</template>
