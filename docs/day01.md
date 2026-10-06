# Day 1 — React 렌더링 모델 + JSX + State

> 2026-10-06 · 실습: `react-basics/src/day01/` (`TodoApp.vue` → `TodoApp.tsx`)

## 핵심 한 줄

**Vue는 값의 변경을 "추적"하고, React는 컴포넌트 함수를 "다시 실행"한다.**

| | Vue | React |
|---|---|---|
| 컴포넌트 코드 | `setup()` 한 번 실행 | 렌더링마다 함수 전체 재실행 |
| 변경 감지 | Proxy가 변경을 감지 | `setState` 호출이 리렌더링 요청 |
| 값 변경 방식 | 직접 수정 (`push`, `todo.done = x`) | 새 값으로 교체 (`[...arr]`, `{ ...obj }`) |
| 파생값 | `computed` | 렌더링 중 일반 변수로 계산 |

흐름: **이벤트 → setState → 컴포넌트 함수 재실행 → 화면 갱신**

---

## 실습에서 막힌 것 (Practice → Feedback)

| Vue식으로 작성한 코드 | 문제 | React식 |
|---|---|---|
| `computed` → `useState` + `useEffect` | 한 박자 늦은 렌더링, effect 안 `setTodos(todos.filter())`는 무한 렌더링 | `const filtered = todos.filter(...)` |
| `event.preventDefault` | 호출 안 함 → form 제출로 새로고침 → **add 실패의 원인** | `event.preventDefault()` |
| `addTodo(event: Event)` | DOM `Event` ≠ React 합성 이벤트 → 타입 에러 | `React.FormEvent<HTMLFormElement>` 또는 인라인 추론 |
| `onInput={(e) => setInput(e.data)}` | `data`는 방금 입력한 글자 하나 | `onChange={(e) => setInput(e.target.value)}` |
| `setTodos(todos.splice(i, 1))` | 원본 변경 + **삭제된 요소**를 반환 → 삭제한 것만 남음 | `todos.filter((t) => t.id !== id)` |
| `todos[i].done = !todos[i].done` | 참조가 같아 React가 변경을 모름 → 리렌더링 없음 | `todos.map((t) => t.id === id ? { ...t, done: !t.done } : t)` |
| `` className={`${cond && "active"}`} `` | false일 때 `"false"` 클래스가 붙음 | `cond ? "active" : undefined` |

state는 5개 → **3개**(`todos`, `input`, `filter`). 계산 가능한 값은 state로 두지 않는다.

---

## 복습 질문 — 내 답과 보완

### 1. 왜 일반 변수 대신 state가 필요한가?
- **내 답:** 일반 변수는 렌더링마다 새로 만들어지므로, 초기화되지 않고 값을 유지하기 위해.
- **보완:** state의 역할은 두 가지다.
  1. **렌더링 사이에 값 유지** — React가 컴포넌트 바깥에 값을 보관해 둔다.
  2. **변경 시 리렌더링 요청** — 일반 변수는 바꿔도 화면이 다시 그려지지 않는다.
- 값은 유지하되 리렌더링은 필요 없을 때 쓰는 것이 `useRef` (Day 2).

### 2. `setState` 직후 값이 바뀐 것처럼 생각하면 왜 위험한가?
- **내 답:** 연속으로 같은 값을 건드릴 때 이벤트 루프에서 처리되기 때문? (불확실)
- **보완:** 핵심은 **스냅샷**이다.
  - `const [count, setCount]` — `count`는 `const`다. 이번 렌더링 안에서는 절대 바뀌지 않는다.
  - `setCount(x)`는 변수를 바꾸는 게 아니라 **"다음 렌더링은 x로 해 줘"라는 요청**이다.
  - 한 이벤트 핸들러 안의 여러 setState는 **배칭**되어 핸들러가 끝난 뒤 한 번만 리렌더링된다.
  ```tsx
  setCount(count + 1);
  setCount(count + 1);     // 둘 다 같은 스냅샷 count 기준 → +1
  console.log(count);      // 이전 값
  setCount((c) => c + 1);  // 이전 state 기준으로 바꿀 땐 updater 함수
  ```

### 3. `key`는 왜 필요한가? index를 key로 쓰면?
- **내 답:** 반복 생성된 요소를 개별로 식별하기 위해. index는 배열이 바뀌면 달라지므로 고유한 값을 써야 한다.
- **보완:** 정확히는 **이전 렌더링과 다음 렌더링의 요소를 짝지어** DOM과 state를 재사용하기 위한 것.
  - index는 배열 안에서 유일하긴 하지만 **안정적이지 않다**. 첫 항목을 지우면 두 번째 항목이 key `0`을 물려받아, React는 "key 0은 그대로"라고 판단하고 **이전 항목의 DOM/state를 다른 데이터에 재사용**한다 (입력값, 포커스, 컴포넌트 내부 state가 엉뚱한 항목에 남음).
  - 기준: **유일 + 안정** → 데이터의 id.

---

## 추가 Q&A

### 이벤트 타입은 외워야 하나?
패턴 하나만 기억: `React.<종류>Event<<HTML 요소>>`

| 상황 | 타입 |
|---|---|
| input 변경 | `React.ChangeEvent<HTMLInputElement>` |
| form 제출 | `React.FormEvent<HTMLFormElement>` (최신 타입은 `SubmitEvent`도 있음) |
| 버튼 클릭 | `React.MouseEvent<HTMLButtonElement>` |

- 가장 빠른 방법: **인라인 핸들러로 쓰면 타입 추론** → `onSubmit={(e) => { e.preventDefault(); addTodo(); }}`
- 정확한 타입이 필요하면 인라인으로 쓰고 `e`에 마우스를 올려 복사.

### splice 대신 결과를 바로 반환하는 메서드는?
ES2023의 원본 불변 메서드 세트:

| 원본 변경 | 새 배열 반환 |
|---|---|
| `splice` | `toSpliced` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `arr[i] = x` | `arr.with(i, x)` |

- id로 삭제할 때는 `filter`가 한 줄이라 사실상 표준. index를 이미 알면 `toSpliced`.
- `filter`/`map`/spread는 **얕은 복사**: 배열은 새것이지만 안의 객체는 같은 참조 → 객체 수정이 필요하면 `{ ...t }`로 객체도 새로 만든다.

### `with`는?
`arr.with(index, value)` — 해당 index만 `value`로 바꾼 **새 배열**을 반환. 원본은 그대로.
```ts
[1, 2, 3].with(1, 9);   // [1, 9, 3]
[1, 2, 3].with(-1, 9);  // [1, 2, 9]  (음수 index 가능)
[1, 2, 3].with(5, 9);   // RangeError (범위 밖)
```

### `setCount(count + 1)` vs `setCount((c) => c + 1)`
- `setCount(count + 1)` — **값**을 넘긴다. "다음 값은 (이 렌더링의 count) + 1". 스냅샷 기준.
- `setCount((c) => c + 1)` — **함수**를 넘긴다. "직전 state를 받아서 +1 해 줘". React가 큐를 처리할 때 직전 결과를 `c`로 넣어준다.

```tsx
// count = 0 인 렌더링에서
setCount(count + 1); // 큐: "1로 교체"
setCount(count + 1); // 큐: "1로 교체"
// → 1

setCount((c) => c + 1); // 큐: 0 → 1
setCount((c) => c + 1); // 큐: 1 → 2
// → 2
```

updater가 필요한 경우 = **스냅샷이 이미 낡았을 수 있는 경우**
- 한 핸들러에서 같은 state를 여러 번 업데이트
- `setTimeout`, `await` 이후, `setInterval` 등 나중에 실행되는 콜백 (클로저가 옛 count를 잡고 있음)

한 번만 바꾸는 일반 이벤트에서는 둘의 결과가 같다. **"이전 값으로 다음 값을 계산"하면 updater가 항상 안전한 선택.**
(`setTodos((prev) => [...prev, newTodo])`도 같은 원리)

---

## 다음에 다시 볼 것
- [ ] Feedback 코드를 보지 않고 `toggleTodo` / `removeTodo` 다시 작성하기
- [ ] 파생값을 만들 때 `useEffect`부터 떠올리지 않기
- [ ] 배열/객체 state를 바꿀 때 "이 줄이 원본을 바꾸는가?" 먼저 확인하기
