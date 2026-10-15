// Vue Router 원본. 이 구조를 Next.js App Router(src/app/)로 옮긴다.
import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from './DefaultLayout.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', component: () => import('./pages/HomePage.vue') },
        { path: 'properties', component: () => import('./pages/PropertyListPage.vue') },
        {
          path: 'properties/:id',
          component: () => import('./pages/PropertyDetailPage.vue'),
          props: true,
        },
      ],
    },
    { path: '/:pathMatch(.*)*', component: () => import('./pages/NotFoundPage.vue') },
  ],
})
