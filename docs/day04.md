# Day 4 — 미니 과제 (60분, AI 사용)

> 2026-10-11 · 실습: `react-basics/src/day04/` · 요구사항과 회고: `react-basics/src/day04/README.md`

## 핵심 한 줄

**AI가 코드를 쓰면 내 일은 "실행해 보고 판단하기"와 "내 말로 설명하기"다.**

---

## 결과

- 44분 동안 요구사항 1~11을 모두 구현했다 (P0 → P1 → P2 순서).
- AI 코드에서 실행해 보고 고친 것: 실패 모드가 캐시에 가려지는 문제, 유형을 바꿀 때 깜빡임, 상세 닫기.
- 직접 타이핑하지 않았다 → 아래 설명 확인 질문으로 이해도를 점검했다.

## 쓰인 패턴 (Day 1~3 복습)

| 패턴 | 위치 |
|---|---|
| 파생 값은 state로 두지 않고 렌더링 중에 계산 | `visibleProperties` |
| state 변경과 외부 호출을 핸들러에서 함께 처리 | `handleFailModeChange` |
| lazy initializer | `useState(loadFavoriteIds)` |
| effect는 외부 시스템에만 사용 | 타이머(`useDelayedFlag`), localStorage(`useFavorites`) |
| key factory로 무효화 범위 조절 | `propertyKeys.lists()` / `detail(id)` |

---

## 설명 확인 질문 — 내 답과 보완

### 1. `keepPreviousData`를 쓸 때 유형을 바꾸면?
- **내 답:** `isPending`은 false, `isPlaceholderData`는 true.
- ✅ 맞다. 목록 분기(`if isPending … else if isError … else`)의 흐름은 다음과 같다.
  - `isPending`이 false라서 "불러오는 중"으로 가지 않고 **이전 유형의 목록이 그대로 그려진다**.
  - 그 위에 200ms가 지나면 `showSwitchingIndicator`가 "불러오는 중"을 띄운다.
  - 예외: 앱을 처음 열 때는 이전 데이터가 없으므로 `isPending`이 true다.

### 2. `useDelayedFlag`는 왜 `active && elapsed`를 반환하나?
- **내 답:** mount 때 한 번 실행되어 true가 되므로 cleanup에서 false로 바꾼다.
- **보완:** cleanup의 역할은 맞지만 질문의 핵심은 **실행 시점**이다. (참고: mount 때 `active`가 false면 effect는 바로 return하므로 true가 되지 않는다.)
  ```
  active: true → false로 바뀜
  ① 렌더링   active=false, elapsed=true (아직 cleanup 전)
  ② 커밋 후  cleanup → setElapsed(false)
  ③ 렌더링   active=false, elapsed=false
  ```
  - `elapsed`만 반환하면 ①에서 로딩 문구가 한 번 더 그려진다.
  - `active && elapsed`로 반환하면 ①에서 바로 false가 된다.
  - **Day 2와 같은 원리다.** effect는 렌더링 후에 실행되므로 그 사이의 렌더링은 이전 state를 본다.
- 실험: `react-basics/src/day04/experiments/DelayedFlagLog.tsx` — 콘솔에서 render / effect / cleanup 순서와 빨간 줄(①)을 확인한다.

#### 한 번의 state 변경이 처리되는 순서
```
setState
→ ① render     컴포넌트 함수 실행 (JSX 계산). 화면은 아직 그대로
→ ② commit     DOM에 반영
→ ③ paint      브라우저가 화면에 그림
→ ④ cleanup    "이전" 렌더링의 effect가 반환한 함수 (deps가 바뀐 effect만)
→ ⑤ effect     "이번" 렌더링의 effect
   └ 여기서 setState를 하면 ①부터 다시
```
- cleanup은 unmount 때만 실행되는 게 아니다. **deps가 바뀌어 effect를 다시 실행하기 직전에도** 실행된다.
- Vue와 비교: Vue의 `watch`(기본)는 ① 전에, `onUpdated`는 ② 후에 실행된다. React effect는 ③ 후라서 ①의 렌더링은 항상 이전 state를 본다.

### 3. `useFavorites`의 localStorage 저장 effect는 Day 2 원칙과 충돌하나?
- **내 답:** 충돌하는 것 같다.
- **보완:** 충돌하지 않는다. Day 2 원칙을 정확히 다시 쓰면 다음과 같다.
  - **React state → React state** 맞추기: effect 금지, 핸들러에서 함께 바꾼다 (Day 2의 `selectedId` 초기화).
  - **React state → 외부 시스템**(localStorage, DOM, 타이머) 맞추기: effect의 원래 용도다.
- 핸들러에서 저장하는 방식과 비교:

  | | effect 저장 (현재) | 핸들러 저장 |
  |---|---|---|
  | 코드 | `useEffect(() => save(ids), [ids])` | `toggleFavorite`에서 `next` 계산 → `setIds(next)` + `save(next)` |
  | 장점 | 즐겨찾기를 바꾸는 함수가 늘어나도 저장이 한 곳에 있다 | 저장이 사용자 행동에 붙어 있다 |
  | 주의 | mount 때 읽은 값을 그대로 다시 저장한다 (무해함) | updater(`prev => …`) 안에서 저장하면 안 된다. updater는 순수해야 하고 StrictMode가 두 번 호출한다 |

  둘 다 정답이다. 현재 코드가 더 단순하다.
- 둘 중 무엇을 고를지 정하는 질문: **"이 코드는 왜 실행되는가?"**
  - "state가 이 값이면 외부도 이 값이어야 하니까" (동기화) → effect. 예: localStorage 저장, `document.title`
  - "사용자가 이 행동을 했으니까" (사건) → 핸들러. 예: 제출 시 POST, 클릭 로그 전송
  - localStorage 저장은 두 해석이 다 가능해서 둘 다 정답이다. POST를 effect에 두면 mount나 StrictMode에서 중복 요청이 생긴다.

### 4. 삭제 후 `lists()`만 무효화하고 `removeQueries(detail(id))`를 하는 이유
- **내 답:** 열린 상세까지 무효화하지 않으려고. `detail(id)`는 열린 상세가 삭제된 경우에만 갱신하려고.
- **보완:** 앞부분은 맞다. `all`로 무효화하면 화면에 열린 상세(active)가 바로 재요청되고, 삭제된 id라서 "찾을 수 없음" 에러가 뜬다.
- 뒷부분은 **invalidate와 remove의 차이**로 봐야 한다.

  | | 동작 |
  |---|---|
  | `invalidateQueries` | stale로 표시 → 쓰는 중이면 **다시 요청** |
  | `removeQueries` | 캐시에서 **지움**. 요청하지 않음 |

  - `removeQueries(detail(id))`는 "갱신"이 아니라 **삭제된 매물의 캐시를 버리는 정리 작업**이다. 열려 있었든 아니든 그 id의 데이터는 더 이상 의미가 없다.
  - 열려 있던 상세를 닫는 건 `PropertyApp`의 `onSuccess`에서 `setSelectedId(null)`이 한다.
- 다시 정리한 내 답: "삭제한 id의 상세 캐시를 지운다" ✅. 처음 답에서 어긋난 단어는 두 개였다.
  - "열려 있는 상세" → 열려 있는지와 관계없이 **삭제한 id**가 대상이다.
  - "갱신" → remove는 요청하지 않는다. **제거**다.
  - "상세 전체가 아니라 그 id만"이라는 범위 설명은 맞다.

### 5. `.filter(...).sort(...)`에서 `filter`가 빠지면?
- **내 답:** 이해가 부족하다 → 아래 설명.

#### `sort`는 새 배열을 만들지 않고 원본을 바꾼다
```ts
const a = [3, 1, 2]
const b = a.sort()   // a 자체가 [1, 2, 3]으로 바뀜
b === a              // true — 같은 배열
```

#### 지금 코드는 왜 안전한가
```ts
(data ?? [])            // data = React Query 캐시에 있는 배열 그 자체
  .filter(...)          // ← 새 배열 생성 (복사본)
  .sort(...)            // ← 복사본을 정렬 → 캐시는 그대로
```

#### `filter`를 지우면
검색 기능을 빼거나 정렬만 따로 떼어내는 리팩터링에서 이렇게 될 수 있다.
```ts
(data ?? []).sort(...)  // ← 캐시 배열을 직접 정렬
```
- 렌더링 중에 **React Query 캐시를 직접 바꾼다**. 같은 쿼리를 쓰는 다른 컴포넌트도 정렬된 순서를 보게 된다.
- "기본순"으로 돌아가도 원래 순서로 돌아오지 않는다. 캐시가 이미 다시 정렬됐기 때문이다.
- Day 1의 "state는 직접 바꾸지 않는다"를 어긴 것과 같다. 쿼리 데이터도 불변으로 다뤄야 한다.

#### "기본순"으로 돌려도 왜 원래대로 안 돌아오나
"기본순"은 정렬하는 게 아니라 **비교 함수가 0을 반환해 아무것도 안 바꾸는 것**이다. 원래 순서는 "API가 준 배열 그대로"에 기대고 있다.
```
API 응답(캐시)        [A(50), B(30), C(70)]
월세 낮은 순 (원본 sort) → 캐시 자체가 [B, A, C]로 바뀜
기본순 (return 0)       → [B, A, C]를 그대로 둠
```
- 원래 순서를 기억하는 복사본이 어디에도 없으니 되돌릴 기준이 없다.
- 더 나쁜 점: refetch(창 포커스, invalidate)로 캐시가 새 배열로 바뀌면 그때는 원래 순서로 돌아온다. **재현될 때도 있고 안 될 때도 있는 버그**가 된다.

#### 해결: 복사본을 반환하는 메서드 (ES2023)
```ts
data.toSorted((a, b) => a.monthlyRent - b.monthlyRent)  // 새 배열, 원본 그대로
[...data].sort(...)                                       // ES2023 이전 방식
```

| 원본을 바꿈 | 복사본을 반환 (ES2023) |
|---|---|
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `splice` | `toSpliced` |
| `arr[i] = x` | `arr.with(i, x)` |

> `toSorted`를 쓰면 "앞에 `filter`가 있어서 안전하다"는 숨은 전제가 사라진다. 코드 순서가 바뀌어도 버그가 생기지 않는다.

---

## 사소한 피드백 (코드는 수정하지 않음)
- `.filter().sort()` → `.filter().toSorted()` 권장 (위 5번)
- 삭제한 매물의 id가 즐겨찾기 목록에 남는다. 화면에는 영향이 없어 과제 수준에서는 넘어가도 된다.

## AI 활용 회고
- 잘한 점: 요구사항을 쪼개서 맡기고, 작업 단위마다 커밋하고, 실행해 보고 문제를 찾아 고쳤다.
- 위험 ① 면접에서 "왜 이렇게 했나"를 물으면 내 말로 답해야 한다 → 이번처럼 설명 확인 질문을 거친다.
- 위험 ② 당일 규칙이 AI 금지나 제한적 허용일 수 있다 → Day 8에 AI 없이 15분 손코딩을 추가한다.

---

## 면접 질문으로 나온다면
- **Q. 배열 메서드 중 원본을 바꾸는 것과 바꾸지 않는 것을 구분해 설명하고, React에서 왜 중요한가요?**
  `sort`, `reverse`, `splice`, `push`는 원본을 바꾸고 `map`, `filter`, `toSorted`, spread는 새 배열을 만든다. React는 이전 값과 새 값을 참조(`Object.is`)로 비교해 변경 여부를 판단한다. 원본을 바꾸면 참조가 같아 변경을 감지하지 못하고, 캐시나 다른 컴포넌트의 데이터도 함께 오염된다.
- **Q. `useEffect`는 언제 써야 하고 언제 쓰지 말아야 하나요?**
  React 바깥(DOM, 타이머, 구독, storage, 네트워크)과 동기화할 때 쓴다. 다른 state나 props로 계산할 수 있는 값, 사용자 이벤트로 생긴 변화는 렌더링 중 계산이나 이벤트 핸들러에서 처리한다. effect는 렌더링 후에 실행되므로 추가 렌더링이 생기고, 그 사이 렌더링은 일관되지 않은 state를 본다.

## 다음에 다시 볼 것
- [ ] effect는 렌더링 **후** 실행된다 → 그 사이 렌더링은 이전 state를 본다 (Day 2, Day 4 2번)
- [ ] render → commit → paint → cleanup(이전) → effect(이번) 순서
- [ ] effect 금지는 "state → state" 동기화에만 해당한다. "state → 외부"는 effect의 원래 용도다 (동기화면 effect, 사건이면 핸들러)
- [ ] invalidate(다시 요청) vs remove(캐시에서 버림)
- [ ] `sort`/`reverse`/`splice`는 원본을 바꾼다 → `toSorted`/`toReversed`/`toSpliced`
