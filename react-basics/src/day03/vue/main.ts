// Vue 쪽 vue-query 등록 (React의 main.tsx QueryClientProvider와 비교용)
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './PropertyCrudApp.vue'

createApp(App)
  .use(VueQueryPlugin, {
    queryClientConfig: {
      defaultOptions: { queries: { retry: 1 } },
    },
  })
  .mount('#app')
