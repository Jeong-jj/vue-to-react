import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <p>매물을 찾을 수 없습니다.</p>
      <Link href={"/properties"}>← 목록으로</Link>
    </>
  );
}
