import { useEffect, useState } from 'react'

// active가 delayMs 이상 계속 true일 때만 true를 돌려준다
// 짧게 끝나는 로딩에서 표시가 깜빡이는 것을 막는 용도
export function useDelayedFlag(active: boolean, delayMs: number) {
  const [elapsed, setElapsed] = useState(false)

  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => setElapsed(true), delayMs)
    return () => {
      clearTimeout(timer)
      setElapsed(false)
    }
  }, [active, delayMs])

  // active가 false로 바뀐 렌더링에서 바로 false가 되도록 함께 확인한다
  return active && elapsed
}
