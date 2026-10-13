import { useEffect, useState } from "react";

// useDelayedFlag에 로그를 붙여 렌더링 → 커밋 → cleanup → effect 순서를 확인한다
// 사용법: src/App.tsx에서 <DelayedFlagLog />를 렌더링하고 개발자 도구 콘솔을 연다
// 흐린 로그는 StrictMode가 한 번 더 실행한 렌더링이므로 무시한다

const DELAY_MS = 1000;

function useDelayedFlagLogged(active: boolean, delayMs: number) {
  const [elapsed, setElapsed] = useState(false);

  console.log(
    `%crender   active=${active}, elapsed=${elapsed} → elapsed만: ${elapsed} / active && elapsed: ${active && elapsed}`,
    elapsed && !active ? "color:#dc2626;font-weight:bold" : "",
  );

  useEffect(() => {
    console.log(`%c   effect 실행 (active=${active})`, "color:#2563eb");
    if (!active) return;
    const timer = setTimeout(() => {
      console.log("%c   ⏰ 타이머 → setElapsed(true)", "color:#d97706");
      setElapsed(true);
    }, delayMs);
    return () => {
      console.log("%c   cleanup → clearTimeout, setElapsed(false)", "color:#7c3aed");
      clearTimeout(timer);
      setElapsed(false);
    };
  }, [active, delayMs]);

  return active && elapsed;
}

export function DelayedFlagLog() {
  const [active, setActive] = useState(false);
  const show = useDelayedFlagLogged(active, DELAY_MS);

  const toggle = () => {
    console.log(`%c── 클릭: active → ${!active}`, "color:#16a34a;font-weight:bold");
    setActive(!active);
  };

  return (
    <div>
      <h1>useDelayedFlag 실행 순서</h1>
      <p>
        ① 시작 → {DELAY_MS}ms 기다리기 → ② 중지. ②에서 빨간 render 줄을 찾는다.
        <br />
        (1초 안에 중지하면 타이머가 취소되는 것도 확인할 수 있다)
      </p>
      <button type="button" onClick={toggle}>
        {active ? "② 중지 (active=false)" : "① 시작 (active=true)"}
      </button>
      <p>{show ? "불러오는 중..." : "-"}</p>
    </div>
  );
}
