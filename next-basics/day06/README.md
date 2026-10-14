# Day 6 Server Component / Client Component (압축판)

> 예상 시간: 60분 · 원본: `day06/vue/` → 구현: `src/`
> 내일이 과제라 압축했다. **개념 15분 → 실습 A 15분 → 실습 B 25분 → 정리 5분**
> AI는 설명 질문에만 쓰고 핵심 파일은 직접 만든다.

## 준비

```bash
cd next-basics && pnpm install   # @tanstack/react-query 추가됨
```

## 1. 개념 (15분)

### Server vs Client

| | Server Component (기본값) | Client Component (`"use client"`) |
|---|---|---|
| 실행 위치 | 서버에서만 | 서버(첫 HTML) **+ 브라우저** |
| `async` / `await` 데이터 | 가능 | 불가 (Query나 Route Handler를 거침) |
| `useState`, `useEffect`, 이벤트 핸들러 | 불가 | 가능 |
| `window`, `localStorage` | 불가 | 가능 (단, 브라우저에서 실행될 때만) |
| 브라우저로 보내는 JS | 없음 | 있음 |

### 규칙 4개
1. 파일 첫 줄의 `"use client"`는 **경계 선언**이다. 그 파일이 import하는 것도 전부 Client가 된다. 그래서 경계는 **필요한 가장 아래(작은 단위)**에 둔다.
   ```
   Page (Server)            ← 데이터는 여기서 await
    ├─ 상세 정보 (Server)
    └─ FavoriteButton (Client)   ← 클릭과 state가 필요한 부분만
   ```
2. Server → Client로 넘기는 props는 **직렬화 가능한 값**만 된다 (문자열, 숫자, 객체, 배열). 함수는 안 된다 (Day 5 1차 커밋의 `onClick={load}` 에러).
3. Client Component는 Server Component를 import할 수 없다. 대신 `children`으로 받을 수는 있다 (layout에 Providers를 감싸는 방식).
4. Client Component도 **첫 HTML은 서버에서 만든다 (SSR).** 그다음 브라우저에서 JS가 붙는다 (hydration).

### SSR, CSR, hydration
```
① 서버: 컴포넌트를 실행해 HTML 생성 (Client Component 포함)
② 브라우저: HTML을 바로 표시 → 보이지만 아직 클릭은 안 됨
③ 브라우저: JS 로드 → React가 같은 컴포넌트를 다시 실행해 HTML에 이벤트를 붙임 = hydration
```
- **hydration 조건: ①과 ③의 첫 렌더링 결과가 같아야 한다.** 다르면 hydration mismatch 에러가 난다.
- `localStorage`, `Date.now()`, `Math.random()`처럼 서버와 브라우저에서 값이 다른 것을 렌더링 중에 쓰면 이 에러가 난다.
- Vue SPA(CSR)는 ①이 없어서 이 문제가 없었다. Nuxt를 써 봤다면 `onMounted`나 `<ClientOnly>`로 피하던 것과 같은 문제다.

## 2. 실습 A: 즐겨찾기 버튼 (15분)

원본: `day06/vue/FavoriteButton.vue`

1. `src/components/FavoriteButton.tsx`를 만든다. Vue처럼 `useState(() => JSON.parse(localStorage...))`로 읽어 본다.
2. `properties/[id]/page.tsx`(Server)에 `<FavoriteButton id={property.id} />`를 넣고 상세 페이지를 연다.
3. **에러를 확인한다.** (`localStorage is not defined`: ①에서 서버가 실행하다 실패)
4. 아래 패턴으로 바꾼다. 브라우저 저장소처럼 **React 바깥의 값을 읽을 때 쓰는 훅**이 `useSyncExternalStore`다.
   ```ts
   const KEY = "favorites";
   const listeners = new Set<() => void>();
   function subscribe(listener: () => void) {
     listeners.add(listener);
     return () => listeners.delete(listener);
   }
   const getSnapshot = () => localStorage.getItem(KEY) ?? "[]";   // 브라우저에서 읽는 값
   const getServerSnapshot = () => "[]";                          // 서버(①)와 hydration(③)에서 쓰는 값

   export function useFavoriteIds() {
     const ids: number[] = JSON.parse(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
     const toggle = (id: number) => {
       const next = ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id];
       localStorage.setItem(KEY, JSON.stringify(next));
       listeners.forEach((l) => l());   // 구독 중인 컴포넌트에 바뀌었다고 알림
     };
     return { ids, toggle };
   }
   ```
   - ①과 ③은 `getServerSnapshot`(빈 배열)으로 같게 그리고, hydration이 끝나면 실제 저장값으로 다시 그린다 → mismatch 없음.
   - `useState([])` + `useEffect`에서 `setIds(...)`로 읽는 방법도 동작하지만, 이 프로젝트의 lint(`react-hooks/set-state-in-effect`)가 에러로 막는다.
5. 즐겨찾기 상태를 바꾸고 새로고침해서 유지되는지 확인한다.

## 3. 실습 B: Client 검색 화면 + TanStack Query (25분)

원본: `day06/vue/PropertySearchPage.vue` (`/search`, 입력할 때마다 즉시 필터)

입력마다 바뀌는 화면이라 state가 필요하다 → Client Component. 데이터는 Query로 받는다.

```
src/app/
├── providers.tsx              ← "use client", QueryClientProvider
├── layout.tsx                 ← <Providers>로 children 감싸기
├── api/properties/route.ts    ← Route Handler: GET /api/properties
└── search/page.tsx            ← Server. <PropertySearch />만 렌더링
src/components/
└── PropertySearch.tsx         ← "use client", keyword state + useQuery
```

1. **providers.tsx**
   ```tsx
   const [queryClient] = useState(() => new QueryClient());
   ```
   - Day 3에서는 모듈 최상단에서 만들었다. Next에서는 **서버가 여러 사용자의 요청을 같은 모듈로 처리하므로**, 모듈 최상단에 두면 사용자끼리 캐시를 공유하게 된다. 그래서 컴포넌트 안에서 lazy initializer로 만든다.
2. **layout.tsx**: `<body><Providers>...</Providers></body>`. layout은 Server Component로 남는다 (Providers가 `children`으로 받으므로, 규칙 3).
3. **api/properties/route.ts**
   ```ts
   export async function GET() {
     return Response.json(await fetchProperties("all"));
   }
   ```
   - 왜 필요한가: Client Component에서 `@/lib/api`를 직접 import하면 그 mock은 **브라우저에서 따로 실행된다** (서버의 메모리 DB와 다른 복사본). 브라우저가 서버 데이터를 받으려면 HTTP 엔드포인트가 필요하다. 과제에서 API가 따로 없으면 이 방식으로 만든다.
   - Vue 개발로 치면 Express 같은 백엔드 라우트를 같은 프로젝트에 두는 것이다.
4. **PropertySearch.tsx**: Vue 원본을 옮긴다. `fetch("/api/properties")` + `res.ok` 확인, loading / error / empty 처리, 결과는 `/properties/{id}`로 가는 `Link`
5. header nav에 `/search` 링크 추가

## 4. 정리 (5분) + 복습 질문

1. CSR, SSR, Server Component, Client Component를 한 문장씩 설명하기
2. `FavoriteButton`은 왜 Client이고, 상세 page는 왜 Server로 남겨 두었나?
3. 실습 A의 `localStorage is not defined`는 왜 났나? Vue SPA에서는 왜 안 났나?
4. `/properties`(Server, searchParams)와 `/search`(Client, Query)의 차이는? 과제에서 검색 화면을 만든다면 어느 쪽을 고르겠나?
5. `QueryClient`를 Next에서 모듈 최상단이 아니라 `useState`로 만드는 이유는?

## 완료 기준

- `"use client"`를 무조건 붙이지 않고, 필요한 컴포넌트에만 붙였다
- `pnpm build`, `pnpm lint` 통과 후 `Practice:` 커밋
