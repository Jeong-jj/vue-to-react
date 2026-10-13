"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function Error({ error, retry }: Props) {
  // 에러 로그 전송은 외부 시스템이므로 effect에서 한다
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      {/* 배포 환경에서 Server Component의 error.message는 일반 문구로 가려지므로 문구는 직접 쓴다 */}
      <p>목록을 불러오지 못했습니다.</p>
      {/* reset은 다시 요청하지 않고 다시 그리기만 하므로, 서버 데이터 에러는 retry로 복구한다 */}
      <button type="button" onClick={retry}>
        다시 시도
      </button>
    </div>
  );
}
