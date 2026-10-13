<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">홈</RouterLink>
      |
      <RouterLink to="/properties">매물 목록</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
</template>
