import { fetchProperty } from "@/lib/api";
import { CATEGORY_LABEL, Property } from "@/lib/types";
import Link from "next/link";

interface Props {
  id: string;
}

export default async function Page({ id }: Props) {
  let property: Property | null = null;
  let loading: boolean = false;
  let notFound: boolean = false;

  async function load() {
    loading = true;
    notFound = false;

    try {
      property = await fetchProperty(Number(id));
    } catch {
      notFound = true;
    } finally {
      loading = false;
    }
  }

  await load();

  return (
    <>
      <Link href={"/properties"}>← 목록으로</Link>

      {loading ? (
        <p>상세 정보를 불러오는 중...</p>
      ) : notFound ? (
        <p>매물을 찾을 수 없습니다.</p>
      ) : property !== null ? (
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
      ) : null}
    </>
  );
}
