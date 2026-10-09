# Day 2 — Props / Form / 컴포넌트 설계 / Hooks

> 2026-10-07 ~ 10-09 · 실습: `react-basics/src/day02/` (`vue/` → `React/`)
> 실험: `react-basics/src/day02/experiments/WatchVsHandler.tsx`

## 핵심 한 줄

**React 컴포넌트는 props 객체 하나를 받는 함수이고, effect는 "외부 시스템과의 동기화"에만 쓴다.**

---

## Vue → React 변환표

| Vue | React | 비고 |
|---|---|---|
| `defineProps<{ a: T }>()` | `({ a }: Props) =>` | 컴포넌트 인자는 **props 객체 하나**. `<C a={1} b={2} />` = `C({ a: 1, b: 2 })` |
| `defineEmits` + `emit('change', v)` | callback prop `onChange(v)` | 이름은 `on` + 동사가 관례 |
| `defineModel` / `v-model` | `value` + `onChange` 한 쌍 | `value`를 빼면 state와 input이 끊김 (지우기 버그) |
| 자식에 `@click` → 루트에 자동 부착 (fallthrough attrs) | **자동 부착 없음** | 받은 prop을 직접 `<li onClick={onClick}>`에 연결 |
| `<slot />` | `children` prop | 타입은 `ReactNode` |
| `ref="el"` + `onMounted(focus)` | `useRef` + `useEffect(..., [])` | 단순 포커스는 `<input autoFocus />`로 충분 |
| composable + `onMounted`/`onUnmounted` | custom hook + `useEffect` cleanup | 등록과 해제를 한 effect에 |
| `watch(category, reset)` | **이벤트 핸들러에서 함께 변경** | 아래 "watch vs 핸들러" 참고 |
| `v-if` / `v-else` | 삼항 연산자 | |

---

## 라이프사이클: Vue는 "시점", React는 "동기화"

| Vue | React | 주의 |
|---|---|---|
| `setup()` 1회 | 함수 본문 매 렌더링 | |
| `onMounted` | `useEffect(fn, [])` | 화면이 그려진 뒤 실행 |
| `onUnmounted` | effect가 return하는 cleanup | |
| `watch(x, fn)` | `useEffect(fn, [x])`처럼 보이지만 다름 | mount 시에도 실행, 렌더링 **후** 실행 |
| `onUpdated` | `useEffect(fn)` (deps 없음) | 거의 안 씀 |

- effect가 필요한 경우 = **React 바깥(DOM, window 이벤트, 네트워크, 타이머)과 연결할 때**.
- deps 규칙: 없음 → 매 렌더링 / `[]` → mount 1회 / `[x]` → mount + x 변경 시.
- `useRef` 객체는 매 렌더링 같은 객체 → deps에 넣어도 바뀌지 않음. `ref.current`가 바뀌어도 effect는 다시 실행되지 않는다 (ref는 반응형이 아님).
- StrictMode(개발 모드)는 mount → unmount → mount를 한 번 더 한다 → cleanup이 빠지면 여기서 드러남.

## 렌더링 범위

| Vue | React |
|---|---|
| 바뀐 값을 **실제로 쓰는** 컴포넌트만 다시 렌더링 | setState한 컴포넌트와 **자식 전부** 재실행 (`memo`로 건너뛰기 가능) |

---

## watch vs 이벤트 핸들러 (오늘의 핵심)

### 실험 결과 (`WatchVsHandler.tsx`, 카테고리 변경 시)
```
A. useEffect
render  category=officetel, selectedId=1      ← 있을 수 없는 조합
   📡 Detail effect: category=officetel, 매물=역삼 래미안   ← 자식이 그 조합으로 동작
   ↳ useEffect([category]) → setSelectedId(null)
render  category=officetel, selectedId=null

B. 핸들러
render  category=officetel, selectedId=null   ← 렌더링 1번, 처음부터 일관됨
```
mount 시에도 A의 effect는 실행된다 (StrictMode라 2번).

### Vue `watch`는 괜찮은데 React `useEffect`는 왜 문제인가
차이는 **콜백이 실행되는 시점**이다.

| | 흐름 | 렌더링 |
|---|---|---|
| Vue `watch` (기본 `flush: 'pre'`) | 값 변경 → **렌더링 전에** watch 콜백 → 렌더링 | 1번, 일관됨 |
| React `useEffect` | setState → **렌더링** → 커밋 → effect → setState → 렌더링 | 2번, 첫 번째는 불일치 |
| React 핸들러 | setCategory + setSelectedId (배칭) → 렌더링 | 1번, 일관됨 |

- Vue의 watch는 렌더링 전에 끼어들 수 있어서 "값 변화에 반응"해도 문제가 없다.
- React의 effect는 **이미 렌더링된 뒤에야** 실행된다. 렌더링 전에 관련 state를 맞추려면 변화를 일으킨 **이벤트 핸들러** 안에서 같이 바꿔야 한다.
- 의미상으로도 "카테고리가 바뀌면 선택 해제"보다 **"사용자가 카테고리를 고르면 선택도 초기화"**가 정확한 규칙이다. 규칙이 사용자 행동에 붙어 있으니 핸들러가 맞는 위치.

---

## 커밋 흐름 (Practice 1 → 4)

| 커밋 | 상태 |
|---|---|
| 1차 | 인자를 여러 개 받는 일반 함수 형태 → props가 전달되지 않음 |
| 2차 | props 객체로 수정, watch를 `useEffect`로 직역 |
| 3차 | 핸들러에서 처리, controlled input, `children` 정리 |
| 4차 | 미사용 import 제거(빌드 실패 원인), `onChange` 네이밍, deps `[]` |

---

## 복습 질문 — 내 답과 보완

### 1. state는 몇 개, 어디에, 왜?
- **내 답:** 3개, `PropertyApp`. 최상단 부모에서 관리하고 props로 내려준다.
- **보완:** 기준은 "최상단"이 아니라 **그 state를 쓰는 컴포넌트들의 가장 가까운 공통 부모**다 (lifting state up). `keyword`는 `SearchInput`(표시)과 필터링(`PropertyApp`)이 같이 쓰므로 공통 부모가 `PropertyApp`이 된다. 한 컴포넌트만 쓰는 state는 그 컴포넌트 안에 둔다.

### 2. 계산 가능한 값을 state로 만들지 않았나?
- **내 답:** 만들지 않았다. 리렌더링 때 계산도 갱신된다.
- ✅ `filteredItems`, `selectedItem` 모두 렌더링 중 계산.

### 3. `useEffect`는 몇 개, 외부 시스템 동기화가 맞나?
- **내 답:** 2개. 커스텀 훅(keydown 등록/해제), input 포커스.
- **보완:** 둘 다 React 바깥(window 이벤트, DOM 포커스)이라 맞다. 정확히는 "렌더링 시"가 아니라 **렌더링이 화면에 반영된 뒤** 실행된다.
  - 포커스는 `autoFocus` 속성으로 effect 없이도 가능.
  - `useEscapeKey`는 deps가 없어 매 렌더링마다 해제/재등록한다. 동작은 정확하다. `[]`로 바꾸면 첫 렌더링의 `handler`에 갇히는 **stale closure** 위험이 있다. 정석 해법(`useEffectEvent` 등)은 심화 주제.

### 4. `watch`는 무엇으로 바꿨고 왜?
- **내 답:** 처음엔 `useEffect`, 렌더링 효율과 로직상 핸들러에서 다룰 수 있어 옮겼다.
- **보완:** effect는 렌더링 **후** 실행돼서 불일치 렌더링 + 추가 렌더링 + mount 시 실행이 생긴다. 핸들러에서 같이 바꾸면 배칭으로 한 번에 일관된 렌더링.

### 5. 렌더링 로그 실험 결과
- **내 답:** `useEffect` 사용 시 불필요한 추가 렌더링을 확인했다.
- **보완:** 추가로 ① mount 시에도 effect 실행, ② 첫 렌더링에서 자식 effect가 **잘못된 state 조합**으로 실행되는 것까지 확인.

---

## 추가 Q&A

### 콘솔의 `installHook.js`는 뭔가?
React 훅이 아니라 **React DevTools 브라우저 확장**의 파일이다. StrictMode가 두 번째로 실행한 렌더링의 로그를 DevTools가 가로채 흐리게 표시하는데, 그 로그는 DevTools를 거쳐 찍히므로 출처가 `installHook.js`로 표시된다. 흐린 줄 = StrictMode의 중복 실행.

---

## 다음에 다시 볼 것
- [ ] 자식에 넘긴 이벤트는 자동으로 붙지 않는다 → 받은 prop을 직접 연결
- [ ] `watch`를 옮길 때 `useEffect`부터 떠올리지 말고 "이 변화를 일으킨 이벤트는?"부터 묻기
- [ ] 커밋 전 `pnpm build`
