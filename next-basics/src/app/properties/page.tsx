import { fetchProperties } from "@/lib/api";
import { Category, CATEGORY_LABEL, Property } from "@/lib/types";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: Category }>;
}) {
  const searchValue = (await searchParams).category;
  const category =
    typeof searchValue === "string" && searchValue in CATEGORY_LABEL
      ? searchValue
      : "all";

  const properties: Property[] = await fetchProperties(category);

  return (
    <>
      <h1>매물 목록</h1>

      <nav>
        <Link href={{ query: {} }}>전체</Link>
        {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
          <Link key={key} href={{ query: { category: key } }}>
            {label}
          </Link>
        ))}
      </nav>

      {!properties.length ? (
        <p>매물이 없습니다.</p>
      ) : (
        <ul>
          {properties.map((p) => (
            <li key={p.id}>
              <Link href={`/properties/${p.id}`}>
                {p.title} · {CATEGORY_LABEL[p.category]} · {p.deposit} /{" "}
                {p.monthlyRent}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
