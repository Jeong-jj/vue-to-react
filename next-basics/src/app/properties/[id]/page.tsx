import { fetchProperty } from "@/lib/api";
import { CATEGORY_LABEL } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function Page({ params }: PageProps<"/properties/[id]">) {
  const { id } = await params;
  // mock API는 "없음"과 "실패"를 구분하지 않으므로 실패를 모두 없음으로 본다
  // 실제 API라면 404일 때만 notFound(), 나머지는 throw해서 error.tsx로 보낸다
  const property = await fetchProperty(Number(id)).catch(() => null);
  if (!property) notFound();

  return (
    <>
      <Link href={"/properties"}>← 목록으로</Link>

      <article>
        <h1>{property.title}</h1>
        <dl>
          <dt>유형</dt>
          <dd>{CATEGORY_LABEL[property.category]}</dd>
          <dt>보증금 / 월세</dt>
          <dd>
            {property.deposit} / {property.monthlyRent} (만원)
          </dd>
          <dt>전용면적</dt>
          <dd>{property.area}㎡</dd>
          <dt>설명</dt>
          <dd>{property.description}</dd>
        </dl>
      </article>
    </>
  );
}
