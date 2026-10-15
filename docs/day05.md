# Day 5 Next.js App Router

> 2026-10-13 ~ 10-14 · 실습: `next-basics/src/app/` · 가이드와 Vue 원본: `next-basics/day05/`

## 핵심 한 줄

**Server Component는 요청마다 위에서 아래로 한 번 실행되고 끝난다. 그래서 "불러오는 중" 같은 상태를 들고 있을 필요가 없고, 화면 상태는 파일(loading / error / not-found)로 나뉜다.**

---

## Vue Router → App Router

| Vue Router | Next.js App Router |
|---|---|
| `routes` 배열 | `src/app/` 폴더 구조 |
| `path: 'properties/:id'` | `app/properties/[id]/page.tsx` |
| `DefaultLayout.vue` + `<RouterView />` | `layout.tsx` + `children` |
| `<RouterLink to>` | `<Link href>` |
| `route.params.id` | `params` (Promise → `await`) |
| `route.query.category` | `searchParams` (Promise → `await`) |
| `index.html`의 `<title>` | `export const metadata = { title }` |

## Vue 컴포넌트 하나 → Next 파일 여러 개

| Vue `PropertyListPage.vue` | Next |
|---|---|
| `properties` ref + `load()` | `const properties = await fetchProperties(category)` |
| `loading` ref + `v-if` | `loading.tsx` |
| `error` ref + try/catch | 그냥 throw → `error.tsx` |
| "다시 시도" 버튼 | `error.tsx`의 `retry` |
| `watch(category, load)` | 없음. URL이 바뀌면 page가 새 searchParams로 다시 실행됨 |
| `notFound` ref | `notFound()` → `not-found.tsx` |

- loading / error / not-found 파일은 **그 폴더와 하위 전체에 적용되는 경계**다. 가장 가까운 상위 파일이 쓰인다. 페이지마다 필수가 아니다.
- `error.tsx`는 같은 폴더의 `layout.tsx` 에러는 잡지 못한다 (layout 안쪽을 감싸므로).

---

## Practice → Feedback

| 커밋 | 상태 |
|---|---|
| 1차 | Vue의 ref를 `let` 변수로 옮김 → `onClick={load}` 런타임 에러, `{ id }`로 props를 받아 id가 undefined, entries 순서 반대, TS `never` 에러 |
| 2차 | 상태 변수 제거, `loading.tsx` / `error.tsx` 분리, `params` await |
| Feedback | `retry`, `notFound()`, `PageProps` + 타입 가드, metadata |

### 1차에서 막힌 것: "state와 useEffect를 무엇으로 대체하지?"
- 질문: async page 안에서 `useState`를 쓸 수 없어 `let` 변수로 바꿨지만 여전히 에러. ref를 무엇으로 대체해야 하나?
- 답: **대체할 것이 필요 없다.** 질문을 "무엇으로 바꾸지?"에서 "이 상태가 애초에 필요한가?"로 바꾼다.

| | Vue 컴포넌트 | Server Component |
|---|---|---|
| 수명 | 화면에 계속 살아 있음 | 요청마다 위에서 아래로 **한 번** 실행되고 끝남 |
| 데이터 도착 전 | 렌더링됨 → `loading` ref 필요 | await에서 멈춤 → 끝났을 때는 이미 데이터가 있음 |
| 조건 변경 | state 변경 → 다시 렌더링 → `watch` | URL 변경 → page를 처음부터 다시 실행 |

```vue
<!-- Vue: 컴포넌트가 상태 변화를 직접 들고 있다 -->
<script setup lang="ts">
const properties = ref<Property[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)
async function load() { /* loading → try/await/catch → finally */ }
watch(category, load, { immediate: true })
</script>
```
```tsx
// Next: 데이터 한 줄. loading/error는 파일로
export default async function Page({ searchParams }: PageProps<"/properties">) {
  const { category: value } = await searchParams;
  const properties = await fetchProperties(isCategory(value) ? value : "all");
  return /* 빈 목록 분기 + 목록 */;
}
```

1차 커밋의 각 에러 원인:
- **`onClick={load}` 런타임 에러:** 서버에서 만든 함수는 브라우저로 보낼 수 없다 (아래 "추가 Q&A" 참고).
- **`Page({ id })`에서 id가 undefined:** Next는 page에 `{ params, searchParams }`를 넘긴다. `Number(undefined)` → NaN → 항상 "찾을 수 없음".
- **`Object.entries(...).map(([label, key])`:** entries는 `[key, label]` 순서. 화면에 `apartment`, 링크는 `?category=아파트`가 됐다.
- **TS `Property 'title' does not exist on type 'never'`:**
  ```ts
  let property: Property | null = null;
  async function load() { property = await fetchProperty(...); }   // 안쪽 함수에서 대입
  await load();
  property.title   // TS: 여전히 null로 판단 → null을 걸러낸 분기에서 never
  ```
  TS는 다른 함수 안에서 일어난 대입을 추적하지 않는다. 변수를 없애고 `const property = await fetchProperty(...)`로 쓰면 해결.

### Feedback에서 고친 것과 이유
- **`reset` → `retry`** (Next 16.4): `reset`은 다시 요청하지 않고 다시 그리기만 한다. 서버 데이터 에러는 `retry`로 복구한다. (가이드에도 `reset`으로 잘못 썼다 → 버전별 API는 `node_modules/next/dist/docs/`의 설치된 문서로 확인)
- **없는 매물: `error.tsx` → `notFound()`**
  - 없음은 `notFound()`, 실패는 throw. 없는 매물에 "다시 시도"를 보여주면 다시 해도 계속 없다.
  - mock API는 둘을 구분하지 않아서 `.catch(() => null)`로 합쳤다. **실제 API에서는 쓰면 안 된다** (서버 장애가 "매물 없음"으로 숨겨짐).
    ```ts
    if (res.status === 404) return null           // 없음
    if (!res.ok) throw new Error('조회 실패')      // 실패
    ```
- **`searchParams` 타입**: `{ [key: string]: Category }`는 타입을 속인 것. URL에는 무엇이든 들어온다 → `string | string[] | undefined`로 받고 타입 가드(`value is Category`)로 좁힌다.
- **`error.message`를 화면에 쓰지 않음**: 배포 환경에서 Server Component 에러 메시지는 일반 문구로 가려지고 `digest`(서버 로그 식별자)만 온다. 서버 에러에는 DB 쿼리, 내부 주소 같은 민감 정보가 있을 수 있기 때문.
- **`error: Error & { digest?: string }`**: Next가 서버 에러에 붙이는 `digest`를 표현한 교차 타입. Client 에러에는 없으므로 optional.
- **`const property: Property | null` 제거**: `fetchProperty`는 `Promise<Property>`를 약속하고 실패하면 throw한다. 타입을 직접 넓혀 적으면 불필요한 null 분기가 생긴다. 타입은 추론되게 두면 TS가 체크가 필요한지 알려준다.

### `PageProps<"/properties/[id]">`
- Next 15.5+가 `src/app` 구조를 읽어 `.next/types/routes.d.ts`에 만드는 전역 타입. 제네릭은 폴더 경로를 대괄호까지 그대로 쓴다.
  ```ts
  interface PageProps<AppRoute> {
    params: Promise<ParamMap[AppRoute]>          // "/properties/[id]" → { id: string }
    searchParams: Promise<Record<string, string | string[] | undefined>>
  }
  ```
- 문서의 타입을 직접 써도 정답이다. PageProps는 경로 오타를 잡아주고 폴더 이름이 바뀌면 따라 바뀐다.
- `.next/types`는 `pnpm dev`나 `build`를 한 번 실행해야 생긴다.

---

## Cache Components와 `<Suspense>`

### `<Suspense>`가 하는 일
"이 안쪽은 늦게 준비되니, 그동안 fallback을 먼저 보여주고 준비되면 바꿔 끼운다."

```tsx
<Layout>                                  // 바로 준비됨
  <Suspense fallback={<Loading />}>       // loading.tsx가 이걸 만들어 준다
    <Page />                              // await 600ms
  </Suspense>
</Layout>
```

| | 0ms | 600ms |
|---|---|---|
| Suspense 없음 | 빈 화면 (전부 기다림) | 헤더 + 목록 |
| Suspense 있음 | 헤더 + "불러오는 중..." | 헤더 + 목록 (fallback 자리만 교체) |

- 서버는 준비된 부분(헤더, fallback)을 먼저 보내고, 나머지를 같은 응답으로 이어서 보낸다 (streaming).
- Vue에도 같은 개념이 있다: async `setup()` 컴포넌트를 `<Suspense>`로 감싸고 `#fallback` 슬롯을 보여주는 것.

### Cache Components가 Suspense를 요구하는 이유
- Next는 build 때 HTML을 **최대한 미리 만들어 둔다** (prerender).
- `searchParams`, `params`, 캐시하지 않은 데이터는 **요청이 와야** 알 수 있으므로 미리 만들 수 없다.
- Cache Components는 "미리 만들 수 없는 구간을 `<Suspense>`로 표시하라"고 강제한다. 표시가 없으면 페이지 전체가 기다리게 되므로 build를 실패시킨다.
- 표시하면: 바깥(헤더, fallback)은 build 때 미리 만들고, Suspense 안쪽만 요청 때 채운다 → build 결과의 `◐ Partial Prerender`.
- 해결 방법: `loading.tsx`(폴더 단위) 또는 page 안에서 `<Suspense>`를 직접 감싼다. 데이터를 캐시해도 되면 `"use cache"`.

### 특수 파일은 컴포넌트 트리로 바뀐다
`<Suspense>`를 직접 쓴 적이 없어도, Next는 한 폴더의 특수 파일을 이렇게 겹쳐 감싼다.
```tsx
<Layout>                                       // layout.tsx
  <ErrorBoundary fallback={<Error />}>         // error.tsx
    <Suspense fallback={<Loading />}>          // loading.tsx
      <NotFoundBoundary fallback={<NotFound />}>  // not-found.tsx
        <Page />                               // page.tsx
```
- `loading.tsx`를 만든 것 = `<Suspense>`를 쓴 것. Cache Components의 요구를 이 파일로 채웠다.
- 확인: `loading.tsx`를 잠깐 지우고 `pnpm build` → "uncached or runtime data during prerendering" 에러.
- 이 구조 때문에 `error.tsx`는 같은 폴더의 `layout.tsx` 에러를 못 잡는다 (layout이 바깥에 있음).

### 에러 바운더리가 브라우저에 있어야 하는 이유 (구체적으로)
에러 바운더리는 "에러가 났다"는 **state**를 들고, 에러가 나면 **다시 렌더링**해서 대체 화면으로 바꾸는 컴포넌트다. Server Component는 state도 다시 렌더링도 없으므로 이 역할을 할 수 없다.

서버 page에서 throw했을 때의 흐름:
1. 서버: `Page`를 실행하다 throw → 서버는 그 자리에 "여기서 에러 남(digest)"이라는 표시를 담아 보낸다.
2. 브라우저: React가 트리를 만들다 그 자리에서 에러를 다시 던진다 → 바깥의 `ErrorBoundary`(Client)가 잡아 `error` state에 저장 → `error.tsx`를 그린다.
3. "다시 시도" 클릭 → `retry()`: 서버에 그 구간을 다시 요청 → 성공하면 state를 비우고 `Page`를 그린다.

- `error.tsx`는 이 Client 바운더리가 그리고, `retry` **함수**를 props로 받는다. 함수는 브라우저에서 만들어진 것이라 서버 컴포넌트가 받을 수 없다 → `"use client"` 필수.
- Client Component 안의 에러(클릭 → state 변경 → 렌더링 중 throw)는 처음부터 브라우저에서만 난다. 이것도 같은 바운더리가 잡는다.
- Vue로 치면 부모 컴포넌트에서 `onErrorCaptured`로 잡아 `hasError` ref를 true로 바꾸고 `v-if`로 대체 화면을 그리는 것과 같다. 그 ref와 다시 그리기가 브라우저에 있어야 하는 것.

```vue
<!-- Vue: 직접 만든 에러 바운더리 -->
<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'

const error = ref<Error | null>(null)          // "에러 났음" state

onErrorCaptured((e) => {
  error.value = e as Error                     // 자식 에러를 잡아 state에 저장 → 다시 렌더링
  return false                                 // 더 위로 전파하지 않음
})

const retry = () => (error.value = null)       // state를 비우면 자식을 다시 그림
</script>

<template>
  <div v-if="error">
    <p>목록을 불러오지 못했습니다.</p>
    <button type="button" @click="retry">다시 시도</button>
  </div>
  <slot v-else />
</template>
```
```tsx
// Next: 위 바운더리는 Next가 만들어 주고, 대체 화면만 error.tsx로 받는다
"use client";
export default function Error({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <div>
      <p>목록을 불러오지 못했습니다.</p>
      <button type="button" onClick={retry}>다시 시도</button>
    </div>
  );
}
```

---

## 복습 질문 - 내 답과 보완

### 1. routes 배열의 역할, `[id]` 폴더
- **내 답:** `app` 폴더 디렉터리가 그 역할을 하고, `[id]`는 동적 파라미터.
- ✅ 정확하다. 폴더 = URL 조각, `page.tsx`가 있어야 실제 URL이 된다. `[id]` = Vue Router의 `:id`.

### 2. `useState`, `useEffect` 없이 데이터를 가져온 이유
- **내 답:** 서버 사이드 렌더링이라 상태 변화가 아니라 서버에서 결정된 값으로 계산 후 렌더링된다.
- **보완:** 방향은 맞다. 정확한 용어는 SSR이 아니라 **Server Component**다 (Client Component도 SSR된다, Day 6).
  - Server Component는 요청마다 한 번 실행되고 끝나며 다시 렌더링되지 않는다 → 상태가 필요 없다.
  - `async` 함수라서 데이터를 `await`로 바로 기다릴 수 있다 → 불러오는 동안의 화면은 `loading.tsx`가 맡는다.

### 3. 필터를 URL(`searchParams`)에 둔 장점
- **내 답:** 모르겠다.
- **보완:**
  - 새로고침해도 유지된다. state는 새로고침하면 사라진다.
  - 링크로 공유할 수 있다 (`/properties?category=apartment`).
  - 뒤로 가기 / 앞으로 가기가 필터 변경 단위로 동작한다.
  - **Server Component가 읽을 수 있다.** 서버는 브라우저의 state를 모른다. URL은 요청에 실려 오므로 서버가 그 조건으로 데이터를 가져올 수 있다. Next에서 필터를 URL에 두는 가장 큰 이유.

### 4. `console.log`는 어디에 찍혔나
- **내 답:** 브라우저에 안 찍혔다. 서버 사이드라서?
- ✅ 맞다. Server Component는 서버(Node)에서 실행되므로 **`pnpm dev`를 실행한 터미널**에 찍힌다. 브라우저에서는 그 코드가 실행되지 않는다.
- 개발 모드의 Next는 서버 로그를 브라우저 콘솔에 `Server` 표시를 붙여 다시 보여주기도 한다. 이것은 개발 편의 기능이고, 실제 실행 위치는 서버다.
- 처음에 터미널에도 안 보였던 이유: `react-basics`(Vite, 5173)에서 `pnpm dev`를 실행했다. Next는 `next-basics`(3000)에서 실행해야 한다.

### 5. `error.tsx`에만 `"use client"`가 필요한 이유
- **내 답:** 에러는 서버에서 미리 준비할 수 없고 클라이언트에서 상황에 맞춰 렌더링하기 위해.
- **보완:** 반은 맞다.
  - **상호작용:** "다시 시도" 버튼의 `onClick`이 필요하다. Server Component는 브라우저로 함수를 보낼 수 없다 (1차 커밋의 `onClick={load}` 에러가 이것).
  - **에러 바운더리는 브라우저에서 동작한다:** 에러는 화면 이동 중이나 Client Component 안에서도 난다. 그걸 잡아 대체 화면으로 바꾸는 장치가 브라우저에 있어야 한다.

---

## 추가 Q&A

### next-basics는 왜 Vue 원본만 날짜별로 나뉘어 있나?
- Next는 `src/app/`의 폴더 구조가 곧 URL이다. `src/app/day05/`를 만들면 URL이 `/day05/properties`가 된다 → react-basics처럼 날짜 폴더에 Vue와 React를 나란히 둘 수 없다.
- 구현 코드는 `src/app/` 하나에 날짜가 지나도 쌓는다 (Day 6은 Day 5 page 위에서 Server/Client를 나눈다).
- 날짜별 자료(가이드, Vue 원본)는 `dayNN/`, 날짜별 기록은 브랜치와 PR로 남는다.

### Next를 처음 보는데 Day 5의 목표는?
- App Router 익히기: 폴더 = URL 규칙, `layout`, `Link`, `params` / `searchParams`, `loading` / `error` / `not-found`.
- Vue Router를 알면 라우팅은 대부분 1:1로 대응된다. 정말 새로운 것은 **page가 서버에서 실행되므로 `async`로 만들고 데이터를 바로 `await`한다** 하나.
- 가이드는 `next-basics/day05/README.md`: 1번 대응표 → Vue 원본 훑기 → 2번 순서대로 구현 → 3번 실험 → 복습 질문.

### loading / error / not-found는 페이지마다 필수인가?
아니다. **그 폴더와 하위 전체에 적용되는 경계**이고, 가장 가까운 상위 파일이 쓰인다.
```
app/
├── not-found.tsx          ← 모든 URL
└── properties/
    ├── loading.tsx        ← /properties, /properties/[id] 둘 다
    ├── error.tsx          ← /properties, /properties/[id] 둘 다
    └── [id]/
        ├── not-found.tsx  ← 상세에서만 더 구체적인 문구가 필요할 때
        └── page.tsx
```
| 상위에도 없으면 | 결과 |
|---|---|
| `loading.tsx` | 새 page가 준비될 때까지 이전 화면 유지. 단 Cache Components에서는 build 실패 → 사실상 필요 (page 안 `<Suspense>`로 대신 가능) |
| `error.tsx` | Next 기본 에러 화면 (개발: 오버레이, 배포: "Application error") |
| `not-found.tsx` | Next 기본 404 |

- Vue로 치면 트리 중간에 `<Suspense>`나 에러 바운더리 컴포넌트를 한 번 감싸 두면 그 아래 전체에 적용되는 것. Next는 그 위치를 파일 위치로 정한다.
- 과제 기본값: 루트에 `error.tsx` + `not-found.tsx`, 데이터를 불러오는 구간에 `loading.tsx`. 문구가 달라야 하는 곳에만 추가.

### 404 화면은 어떻게 확인하나?
없는 id로 직접 접속한다: `/properties/999`. (error 화면은 page에서 잠깐 `throw new Error('테스트')`)

### metadata에는 무엇을 넣나?
- 브라우저 탭 제목이다. Vue SPA에서는 `index.html`의 `<title>`에 있어서 이번 Vue 원본(`.vue` 파일)에는 대응값이 없었다. → 서비스명을 넣는다.
```html
<!-- Vue SPA: index.html -->
<title>임대 매물 서비스</title>
```
```tsx
// Next: layout.tsx (또는 page.tsx에서 페이지별로)
export const metadata: Metadata = { title: "임대 매물 서비스" };
```

### Server Component 에러 메시지는 왜 가려지나? (보안)
Server Component는 DB, 내부 API, 비밀 키에 접근한다. 에러 메시지에 DB 쿼리, 테이블 이름, 내부 주소, 파일 경로, 다른 사용자 데이터가 들어 있을 수 있다. 그대로 브라우저로 가면 누구나 개발자 도구로 본다. → 배포 환경에서는 일반 문구 + `digest`(서버 로그와 맞춰볼 식별자)만 보낸다. Client Component 에러는 이미 브라우저에서 난 것이라 그대로 보인다.

### 서버는 왜 브라우저로 함수를 보낼 수 없나?
서버와 브라우저는 **네트워크로 텍스트를 주고받는다.** Server Component의 결과도 JSON 비슷한 텍스트로 바뀌어 간다.
- 데이터(문자열, 숫자, 배열, 객체)는 텍스트로 바꿨다가 다시 만들 수 있다.
- 함수는 코드뿐 아니라 **만들어진 곳의 변수(클로저)**를 잡고 있다. 서버에서 만든 `load`는 서버 메모리의 `category`, DB 연결을 잡고 있어 텍스트로 옮길 수 없고, 옮긴다면 서버 코드와 비밀 값이 노출된다.
```ts
// Vue SPA에서 API 응답을 받을 때와 같은 원리
JSON.stringify({ title: '역삼', load: () => fetch('/x') })
// → '{"title":"역삼"}'   함수는 사라진다
```
```tsx
// Next: Server → Client props
<FavoriteButton id={property.id} />            // ✅ 숫자
<FavoriteButton onToggle={() => save()} />     // ❌ 서버에서 만든 함수
```
- Client Component **안에서 만든** 핸들러는 괜찮다. 그 코드는 처음부터 브라우저용 JS에 들어 있다.
- 예외: `"use server"` Server Action은 함수가 아니라 "서버의 이 함수를 실행해 줘"라는 식별자를 보낸다. 호출하면 네트워크 요청 → 서버에서 실행.

### hydration mismatch 에러 (속성이 다름)
```
A tree hydrated but some attributes of the server rendered HTML didn't match the client properties.
```
- 원인: 브라우저 확장 프로그램(Grammarly, ColorZilla, 다크 모드 등)이 React 로드 전에 `<body>`에 `data-gr-ext-installed` 같은 속성을 붙여 서버 HTML과 달라졌다. 시크릿 창에서는 에러가 없어서 확인됨.
- 에러 아래 `...`를 펼치면 `+`/`-`로 어떤 속성이 다른지 보인다. 낯선 `data-*`면 확장 프로그램.
- 개발할 때 피하는 법:
  1. 개발용 Chrome 프로필을 따로 만들고 React DevTools만 설치 (추천, 과제 당일에도)
  2. 확장 프로그램의 "사이트 액세스"를 "클릭 시" 또는 특정 사이트로 제한
  3. 무시 (개발 모드 경고, 동작에는 영향 없음)
- `<body suppressHydrationWarning>`으로 숨길 수도 있지만 진짜 hydration 버그까지 가려질 수 있어 과제 코드에는 넣지 않는다.
- 우리 코드가 원인인 경우는 렌더링 중에 서버와 브라우저에서 값이 다른 것을 쓸 때다: `typeof window` 분기, `Date.now()`, `Math.random()`, `localStorage` (Day 6).

### 일반 React에서 Suspense는 언제 필요한가?
일반 React에는 build가 Suspense를 강제하는 일은 없다. 컴포넌트가 **"아직 준비 안 됨"을 React에 알리는(suspend)** 경우에 필요하다.

| React | 하는 일 | Vue로 치면 |
|---|---|---|
| `lazy(() => import('./Chart'))` | 그 컴포넌트 코드를 처음 필요할 때 내려받음 (코드 분할) | `defineAsyncComponent(() => import(...))`, router의 `component: () => import(...)` |
| `use(promise)` (React 19) | 렌더링 중에 Promise 값을 읽음. 안 끝났으면 suspend | `<script setup>` 최상단 `await` |
| `useSuspenseQuery` (TanStack) | `useQuery`와 같지만 `isPending` 대신 suspend | vue-query의 `suspense()` |

- "Suspense용"이라도 어디서든 쓸 수 있다. **조상 어딘가에 `<Suspense>`가 하나 있으면** 된다 (바로 위 부모일 필요 없음). Next에서는 `loading.tsx`가 그 경계.
- 경계가 끝까지 없으면 fallback 없이 그 구간 전체가 준비될 때까지 기다린다 (처음 화면이면 앱 전체가 빈 채로). 렌더링 방식에 따라 에러가 나기도 한다. (직접 실행해 확인하지는 못함)

#### Vue의 async setup = `<script setup>` 최상단 `await` (Composition API)
```vue
<!-- PropertyDetail.vue -->
<script setup lang="ts">
const props = defineProps<{ id: number }>()
const property = await fetchProperty(props.id)   // ← 최상단 await = async setup
</script>

<template>
  <h1>{{ property.title }}</h1>   <!-- loading 분기 없음 -->
</template>
```
```vue
<!-- 부모 -->
<Suspense>
  <PropertyDetail :id="1" />
  <template #fallback>불러오는 중...</template>
</Suspense>
```
`<script setup>`은 `setup()` 함수의 축약 문법이다. 최상단에 `await`가 있는 컴포넌트는 부모에 `<Suspense>`가 필요하다.

#### Suspense의 목적: 로딩 처리를 컴포넌트 밖으로 뺀다
```tsx
// useQuery: 컴포넌트가 로딩을 직접 처리
function Detail() {
  const { data, isPending } = useQuery(...)
  if (isPending) return <p>불러오는 중...</p>
  return <h1>{data.title}</h1>
}

// useSuspenseQuery: 컴포넌트는 "데이터가 있다"고 가정
function Detail() {
  const { data } = useSuspenseQuery(...)
  return <h1>{data.title}</h1>
}
<Suspense fallback={<p>불러오는 중...</p>}>
  <Detail />
</Suspense>
```
- **Suspense : 로딩 = 에러 바운더리 : 에러.** 컴포넌트는 성공한 경우만 그리고, 나머지는 바깥 경계가 처리한다. Day 5에서 page는 `await`만 하고 `loading.tsx` / `error.tsx`가 나머지를 맡은 것과 같은 구조.
- 장점: 분기 제거, 여러 컴포넌트의 로딩을 하나의 fallback으로 합침, 서버 렌더링에서 fallback을 먼저 보내고 나머지를 이어 보냄 (streaming).
- 과제 기준으로는 `useQuery` + `isPending` 분기면 충분하다.

#### "data가 항상 있다"
```ts
const { data } = useQuery(...)          // data: Property | undefined
const { data } = useSuspenseQuery(...)  // data: Property
```
- `useQuery`: 로딩 중에도 렌더링된다 → 그 순간 `data`는 `undefined` → 확인 필요.
- `useSuspenseQuery`: 데이터가 올 때까지 렌더링을 멈추고 바깥 `<Suspense>`가 fallback을 보여준다 → `return`까지 왔다면 데이터는 반드시 있다. 타입에서도 `undefined`가 빠진다.
- Server Component의 `await`와 같은 원리: `const property = await fetchProperty(id)` 아래로 왔다면 `property`는 반드시 있다.

### `lazy` 자세히
컴포넌트 코드를 **처음 화면에 나올 때 내려받게** 한다 (코드 분할).
```tsx
// 일반 import: Chart 코드가 처음 받는 JS에 들어간다. 안 보여줘도 받는다
import Chart from './Chart'

// lazy: Chart를 별도 파일로 분리. <Chart />가 처음 렌더링될 때 내려받는다
const Chart = lazy(() => import('./Chart'))

function Dashboard({ open }: { open: boolean }) {
  return (
    <Suspense fallback={<p>차트 불러오는 중...</p>}>
      {open && <Chart />}
    </Suspense>
  )
}
```
- 내려받는 동안 `Chart`가 suspend → 위쪽 `<Suspense>` fallback.
- **모듈 최상단**에 선언한다. 컴포넌트 안에 두면 렌더링마다 새로 만들어져 state가 초기화된다.
- 가져오는 파일에 `export default`가 있어야 한다.
- 쓰는 곳: 무거운 차트, 에디터, 모달처럼 처음부터 필요 없는 큰 컴포넌트.
```ts
// Vue: 같은 개념
const Chart = defineAsyncComponent(() => import('./Chart.vue'))   // 로딩 화면은 loadingComponent 옵션
{ path: 'properties', component: () => import('./pages/PropertyListPage.vue') }   // lazy route
```
- Next는 page가 URL별로 자동 분할되므로 직접 쓸 일이 드물다. 필요하면 `lazy`를 감싼 `next/dynamic`.

### `use` 자세히 (React 19)
렌더링 중에 **Promise(또는 Context)의 값을 읽는다.**
```tsx
function Detail({ propertyPromise }: { propertyPromise: Promise<Property> }) {
  const property = use(propertyPromise)
  return <h1>{property.title}</h1>
}
```
| Promise 상태 | `use()` |
|---|---|
| 성공 | 값 반환 |
| 진행 중 | suspend → 위쪽 `<Suspense>` fallback |
| 실패 | throw → 위쪽 에러 바운더리 (`error.tsx`) |

- **Promise를 렌더링 안에서 만들면 안 된다.** `use(fetchProperty(id))`는 렌더링마다 새 Promise → 끝없이 suspend. 바깥에서 한 번 만들어 넘긴다.
  ```tsx
  // Next: Server Component가 await하지 않고 Promise만 만들어 넘김
  export default function Page() {
    const propertyPromise = fetchProperty(1)
    return (
      <Suspense fallback={<p>불러오는 중...</p>}>
        <Detail propertyPromise={propertyPromise} />   {/* Client Component에서 use() */}
      </Suspense>
    )
  }
  ```
  page는 바로 응답을 시작하고, 데이터는 준비되는 대로 이어서 보낸다 (streaming).
- 일반 훅과 달리 `if`나 반복문 안에서도 호출할 수 있다. `use(SomeContext)`는 `useContext`처럼 동작.
- Vue로 치면 `<script setup>` 최상단 `await` + 부모 `<Suspense>`와 같은 역할.
- 과제 기준: 몰라도 된다 (Server Component `await`나 `useQuery`로 충분). AI 코드에 `use()`나 `lazy()`가 보이면 위쪽에 `<Suspense>`가 있는지 확인.

---

## 면접 질문으로 나온다면
- **Q. SPA 라우팅과 Next.js App Router의 차이는?**
  SPA는 브라우저가 JS를 받은 뒤 라우터가 URL에 맞는 컴포넌트를 그리고 데이터를 요청한다. App Router는 파일 구조로 라우트를 정의하고, 기본이 Server Component라 서버에서 데이터를 가져와 HTML을 만든 뒤 보낸다. 페이지 이동은 `Link`로 클라이언트 측에서 처리하므로 SPA처럼 전체 새로고침 없이 이동한다.
- **Q. 검색 조건을 state가 아니라 URL query에 두는 이유는?**
  새로고침, 공유, 뒤로 가기에서 조건이 유지되고, 서버가 요청만으로 같은 화면을 다시 만들 수 있다. 화면 상태의 기준이 URL 하나가 되어 상태 동기화 문제가 줄어든다.

## 다음에 다시 볼 것
- [ ] Server Component에서는 "상태를 무엇으로 바꾸지?"가 아니라 "이 상태가 필요한가?"부터 묻기
- [ ] 없음은 `notFound()`, 실패는 throw
- [ ] `params` / `searchParams`는 Promise
- [ ] 버전별 API는 설치된 문서(`node_modules/next/dist/docs/`)로 확인
- [ ] Server → Client props는 직렬화 가능한 값만 (함수 X)
- [ ] 과제 당일은 확장 프로그램 없는 개발용 브라우저 프로필로
