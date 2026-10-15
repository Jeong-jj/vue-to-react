import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>임대 매물 서비스</h1>
      <p>아파트, 오피스텔, 원룸 매물을 찾아보세요.</p>

      <Link href={"/properties"}>매물 보러가기</Link>
    </>
  );
}
