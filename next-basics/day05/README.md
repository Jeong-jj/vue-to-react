# Day 5 Next.js App Router

> 예상 시간: 70~80분 · 원본: `day05/vue/` (Vue Router) → 구현: `src/app/`
> **AI는 설명 질문에만 사용하고, 파일은 직접 만든다.** 파일 규칙은 손으로 만들어 봐야 익는다.

## 준비

```bash
cd next-basics
pnpm install
pnpm dev      # http://localhost:3000
```

| 파일 | 내용 |
|---|---|
| `src/lib/api.ts` | Day 3 mock API 그대로 (`fetchProperties`, `fetchProperty`, ...) |
| `src/lib/types.ts`, `data.ts` | Day 2 타입과 데이터 |
| `day05/vue/` | Vue Router 원본 (빌드 대상 아님) |

## 1. 먼저 읽기 (15분): Vue Router → App Router

App Router는 **폴더 구조가 곧 routes 배열**이다.

| Vue Router | Next.js App Router |
|---|---|
| `routes: [{ path: 'properties', component }]` | `src/app/properties/page.tsx` |
| `path: 'properties/:id'` | `src/app/properties/[id]/page.tsx` |
| `DefaultLayout.vue` + `<RouterView />` | `layout.tsx` + `children` |
| `<RouterLink to="...">` | `<Link href="...">` (`next/link`) |
| `router.push()` | `useRouter().push()` (`next/navigation`, Client Component에서만) |
| `route.params.id` | page props의 `params` (**Promise**, `await` 필요) |
| `route.query.category` | page props의 `searchParams` (**Promise**) / Client에서는 `useSearchParams()` |
| `loading` ref + `v-if` | `loading.tsx` |
| `error` ref + 다시 시도 버튼 | `error.tsx` |
| catch-all `/:pathMatch(.*)*` | `not-found.tsx` + `notFound()` |
| `watch(query, load, { immediate: true })` | **없음.** page가 `async` 함수라 `await fetchProperties()`로 바로 가져온다 |

가장 큰 차이:
- `src/app`의 page와 layout은 기본이 **Server Component**다. 서버에서 실행되므로 `async`로 만들고 데이터를 바로 `await`할 수 있다. `useState`나 `useEffect`로 불러올 필요가 없다. (자세한 내용은 Day 6)
- `params`와 `searchParams`는 Next 15부터 **Promise**다. 예전 코드나 AI가 만든 코드에서 `params.id`처럼 바로 쓰는 실수가 자주 나온다.
- Next 15.5+는 page와 layout props 타입을 자동으로 만들어 준다: `PageProps<'/properties/[id]'>`, `LayoutProps<'/'>` (전역 타입이라 import하지 않는다)

## 2. 구현 (45분)

`day05/vue/`를 보고 같은 화면을 `src/app/`에 만든다.

```
src/app/
├── layout.tsx                 ← 수정: lang="ko", 제목, 헤더 nav
├── page.tsx                   ← 수정: 홈
└── properties/
    ├── page.tsx               ← 목록 + 유형 필터 (searchParams)
    ├── loading.tsx
    ├── error.tsx
    └── [id]/
        ├── page.tsx           ← 상세 (params)
        └── not-found.tsx
```

1. **layout.tsx**: `lang="ko"`, `metadata.title`, 헤더에 홈과 매물 목록 `Link`
2. **page.tsx (/)**: 소개 문구와 `/properties`로 가는 `Link`
3. **properties/page.tsx**
   - `async` 함수로 만들고 `searchParams`에서 `category`를 꺼낸다
   - `category`의 타입은 `string | string[] | undefined`다 → `Category | 'all'`로 좁힌다 (Vue 원본의 `computed` 참고)
   - 유형 필터는 **state 없이 `Link`로** 만든다: `/properties?category=apartment`
   - 각 매물은 `/properties/{id}`로 가는 `Link`
4. **properties/[id]/page.tsx**
   - `params`에서 `id`를 꺼낸다 (항상 string → `Number()`)
   - 매물이 없으면 `notFound()` (`next/navigation`) → 같은 폴더의 `not-found.tsx`가 보인다
   - 목록으로 돌아가는 `Link`
5. **loading.tsx / error.tsx / not-found.tsx**
   - `error.tsx`는 첫 줄에 `"use client"`가 **반드시** 필요하다. props(`error`, `reset`)는 공식 문서에서 확인한다
   - error 화면 확인: 목록 page 안에서 잠깐 `throw new Error('테스트')`를 넣었다가 지운다

### Cache Components 주의 (Next 16 기본값)

`next.config.ts`에 `cacheComponents: true`가 켜져 있다. 이 상태에서 `searchParams`, `params`나 캐시하지 않은 데이터를 `<Suspense>` 밖에서 기다리면 `pnpm build`가 실패한다.

```
Error: Route "/properties": Next.js encountered uncached or runtime data during prerendering.
```

**`loading.tsx`가 그 구간을 `<Suspense>`로 감싸 준다.** 위 에러가 나오면 `loading.tsx`가 있는지부터 확인한다.
> 과제 프로젝트를 받으면 `next.config`에서 이 옵션이 켜져 있는지 먼저 본다.

## 3. 확인 실험 (10분)

1. 목록 page 안에 `console.log('목록 렌더링')`을 넣는다. **어디에 찍히는가?** 브라우저 콘솔과 `pnpm dev` 터미널을 둘 다 본다.
2. 목록 → 상세로 이동할 때 DevTools Network 탭에서 **전체 페이지를 새로 받는가?** (`Link` vs `<a href>`를 바꿔 비교)
3. 유형 필터를 누른 뒤 **새로고침, 뒤로 가기**를 해 본다. 필터가 유지되는가?
4. `pnpm build` 결과에서 각 route 옆 기호(`○`, `◐`, `ƒ`)를 확인한다.

## 4. 프로젝트 탐색 연습 (5분)

`next-basics`를 처음 받은 프로젝트라고 생각하고 아래 순서로 보면서 세 문장으로 설명한다.
`package.json` → `next.config.ts` → `src/app/` (URL 구조) → `src/lib/` (API) → 상태 관리 / 스타일

## 완료 기준

- `src/app/`의 폴더만 보고 URL 목록을 말할 수 있다
- `pnpm build` 통과 후 `Practice:` 커밋

## 복습 질문 (PR 전에 답하기)

1. Vue Router의 routes 배열이 하던 일을 App Router에서는 무엇이 하나? `[id]` 폴더는 무슨 뜻인가?
2. 목록 page에서 `useState`, `useEffect` 없이 데이터를 가져올 수 있었던 이유는?
3. 유형 필터를 state가 아니라 URL(`searchParams`)에 둔 장점은?
4. 실험 1의 `console.log`는 어디에 찍혔나? 왜 그런가?
5. `error.tsx`에만 `"use client"`가 필요한 이유는? (추측해도 된다. Day 6에서 확인)
