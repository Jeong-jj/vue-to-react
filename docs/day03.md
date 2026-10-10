# Day 3 — React + TypeScript + TanStack Query

> 2026-10-09 ~ 10-10 · 실습: `react-basics/src/day03/` (`vue/` → `react/`)
> mock API: `react-basics/src/day03/api.ts` (Day 4에서도 사용)

## 핵심 한 줄

**vue-query와 React Query의 API는 거의 같다. 다른 건 "반응성을 전달하는 방법"뿐이다.**

---

## vue-query → React Query 변환표

| vue-query | React Query | 이유 |
|---|---|---|
| `app.use(VueQueryPlugin)` | `<QueryClientProvider client={qc}>` | React엔 앱 플러그인이 없음 → Context Provider로 공급 |
| 훅 인자 `category: Ref<T>` | `category: T` (일반 값) | 아래 "왜 Ref가 필요 없나" |
| `queryKey: computed(() => [...])` | `queryKey: [...]` | |
| `enabled: computed(() => id.value !== null)` | `enabled: id !== null` | |
| `mutation.isPending.value` | `mutation.isPending` | |
| `reactive(form)` + `v-model` | `useState<PropertyInput>` 객체 + `setForm({ ...form, x })` | |
| `v-model.number` | `Number(e.target.value)` | input의 값은 항상 string |
| `<select v-model>` | `value` + `onChange` | `value`가 빠지면 reset이 select에 반영되지 않음 |
| `watch(failMode, setFailMode)` | 체크박스 핸들러에서 함께 호출 | Day 2 교훈 |

---

## 왜 Vue는 `Ref`/`computed`가 필요하고 React는 필요 없나

핵심은 **훅이 몇 번 실행되느냐**다. (렌더링 범위와는 관계없다.)

| | 훅 호출 | 넘긴 값 |
|---|---|---|
| Vue | `setup()`에서 **한 번만** 호출 | 일반 값을 넘기면 그 시점 값에 **고정** → 이후 변화를 보려면 `Ref`(참조)를 넘기고, 파생값은 `computed`로 감싸야 함 |
| React | **매 렌더링마다** 다시 호출 | 매번 그때의 최신 값을 받음 → 일반 값이면 충분 |

```ts
// Vue: 한 번 호출되므로 "나중에 바뀔 값의 참조"가 필요
useProperties(category)          // Ref<Category>
// React: 렌더링마다 호출되므로 "지금 값"이면 충분
useProperties(category)          // Category (state든 props든 계산값이든 상관없음)
```

React Query는 렌더링 때마다 받은 `queryKey`를 이전과 비교해서, 달라졌으면 새 쿼리로 전환한다.

---

## 복습 질문 — 내 답과 보완

### 1. Vue는 `Ref`/`computed`가 필요한데 React는 왜 필요 없나?
- **내 답:** Vue는 반응형 변수로 알려줘야 하고, React는 state가 하위까지 리렌더링시키므로 필요 없다.
- **보완:** 하위까지 리렌더링되는 것과는 관계없다. **Vue 훅은 한 번, React 훅은 매 렌더링 호출**되기 때문이다 (위 표).

### 2. `isPending` vs `isFetching`
- **내 답:** 둘 다 첫 호출에 반응. `isPending`은 첫 호출, `isFetching`은 이후 갱신.
- **보완:** 기준은 "첫 호출"이 아니라 이것이다.
  - `isPending` = **이 queryKey의 데이터가 아직 없다** (캐시 없음)
  - `isFetching` = **지금 요청이 진행 중이다** (첫 요청 포함)

  | 상황 | isPending | isFetching |
  |---|---|---|
  | 처음 보는 카테고리 선택 (캐시 없음) | true | true |
  | 본 적 있는 카테고리, `staleTime`(30초) 이내 | false | false (요청 안 함) |
  | 본 적 있는 카테고리, 30초 지남 | false | true (기존 데이터 보여주며 갱신) |
  | 등록/삭제 후 invalidate | false | true |
- 그래서 "불러오는 중"은 `isPending`, "갱신 중"은 `!isPending && isFetching`.

### 3. `invalidateQueries({ queryKey: ['properties'] })`가 목록과 상세에 모두 영향을 주는 이유
- **내 답:** 나머지 쿼리 키에 해당 값이 포함되어 있어서.
- ✅ 정확히는 **앞부분 일치(prefix) 매칭**. `['properties']`는 `['properties','list','all']`, `['properties','detail',3]`의 앞부분이다.
  - 화면에서 쓰는 중인(active) 쿼리 → 즉시 다시 요청
  - 안 쓰는 쿼리 → stale 표시만 하고 다음에 쓸 때 다시 요청
- 그래서 key factory(`propertyKeys`)로 계층을 맞춰 두면 invalidate 범위를 조절하기 쉽다.

### 4. 폼 state 설계
- **내 답:** 객체 하나. 어차피 state가 바뀌면 컴포넌트 전체가 리렌더링되므로 나눌 필요가 없다.
- **보완:** 리렌더링은 객체 하나든 6개든 같다. 기준은 **함께 바뀌는가**다. 폼 필드는 reset과 submit 때 한꺼번에 다뤄지므로 객체 하나가 편하다. 서로 독립적으로 바뀌는 값이면 나누는 게 낫다.

### 5. 실패 모드 처리를 무엇으로 옮겼나?
- (질문 보충) Vue 원본의 `watch(failMode, (on) => setFailMode(on))`을 React에서 무엇으로 바꿨는지 묻는 질문.
- **실제 코드:** `switchFailMode` 핸들러에서 state와 `setFailMode`를 함께 호출 → ✅ Day 2 교훈 그대로 적용.
- 참고: 이번 watch는 React 바깥(`api.ts` 모듈 변수)과 동기화하는 것이라 `useEffect`도 규칙상 틀리진 않다. 그래도 변화의 원인이 사용자 클릭 하나뿐이므로 핸들러가 더 단순하다.

---

## 추가 Q&A

### `QueryClientProvider`는 표준인가?
- React Query에서 **필수**. 없으면 "No QueryClient set" 에러.
- React 생태계의 공통 패턴: 앱 전체에 공유할 것은 **Context Provider로 트리를 감싼다** (Vue `provide/inject`에 해당). 처음 보는 프로젝트는 진입 파일의 Provider 목록만 봐도 쓰는 라이브러리를 알 수 있다.
- `queryClient`는 컴포넌트 밖(모듈 최상단)에서 생성. 컴포넌트 안에서 만들면 렌더링마다 새로 생겨 캐시가 사라진다. (Next.js에서는 `useState(() => new QueryClient())` 패턴 — Day 5~6)

### `emit('submit', input, reset)` 구조는 React에서도 최선인가?
- **내 생각:** submit 함수에서 바로 reset하기보다, 콜백으로 넘겨서 성공했을 때 reset하는 게 흐름상 맞다.
- ✅ 맞다. 실패했는데 폼이 비워지면 안 되므로 "성공 시 reset"이 핵심이다. React에서 쓰는 다른 방법들:
  ```tsx
  // ① mutateAsync로 Promise를 돌려주고 자식이 기다렸다가 reset
  onSubmit: (input) => createMutation.mutateAsync(input)
  // 자식
  try { await onSubmit(input); reset(); } catch {}

  // ② key를 바꿔서 폼을 새로 mount (state 초기화 트릭)
  <PropertyForm key={formKey} ... />   // 성공 시 setFormKey(k => k + 1)
  ```
  ②는 "key가 바뀌면 React가 다른 컴포넌트로 보고 새로 만든다"는 Day 1의 key 원리를 이용한 것.

### `Object.entries`로 객체 반복하기
- 맞는 방법. 구조분해로 쓰면 읽기 쉽다: `Object.entries(obj).map(([key, label]) => ...)`
- `Object.entries`의 key 타입은 `string`으로 넓어진다 → 좁은 타입이 필요하면 단언(`as Category`).

---

## Feedback에서 고친 것
- `<select>`에 `value={form.category}` 추가 — 없으면 reset 후에도 이전 선택이 보임 (Day 2 지우기 버그와 같은 원인)
- `useState(initialForm())` → `useState(initialForm)` — 함수를 넘기면 첫 렌더링에만 호출 (lazy initializer)
- `initialForm`을 컴포넌트 밖으로 이동 — props/state에 의존하지 않음
- JSX에서 "아무것도 안 그림"은 `undefined`보다 `null`이 관례

---

## 다음에 다시 볼 것
- [ ] input / select / textarea는 **항상 `value`와 `onChange` 한 쌍** (두 번째로 나온 실수)
- [ ] `isPending`(데이터 없음) vs `isFetching`(요청 중)
- [ ] `mutateAsync` + `await` 패턴
