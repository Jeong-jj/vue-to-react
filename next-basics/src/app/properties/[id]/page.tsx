import { fetchProperty } from "@/lib/api";
import { CATEGORY_LABEL, Property } from "@/lib/types";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property: Property | null = await fetchProperty(Number(id));

  return (
    <>
      <Link href={"/properties"}>← 목록으로</Link>

      {property && (
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
      )}
    </>
  );
}
