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

### 5. `error.tsx`에만 `"use client"`가 필요한 이유
- **내 답:** 에러는 서버에서 미리 준비할 수 없고 클라이언트에서 상황에 맞춰 렌더링하기 위해.
- **보완:** 반은 맞다.
  - **상호작용:** "다시 시도" 버튼의 `onClick`이 필요하다. Server Component는 브라우저로 함수를 보낼 수 없다 (1차 커밋의 `onClick={load}` 에러가 이것).
  - **에러 바운더리는 브라우저에서 동작한다:** 에러는 화면 이동 중이나 Client Component 안에서도 난다. 그걸 잡아 대체 화면으로 바꾸는 장치가 브라우저에 있어야 한다.

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
