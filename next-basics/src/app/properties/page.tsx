import { fetchProperties } from "@/lib/api";
import { type Category, CATEGORY_LABEL } from "@/lib/types";
import Link from "next/link";

// URL 값은 무엇이든 들어올 수 있으므로 string | string[] | undefined로 받고 직접 좁힌다
function isCategory(value: unknown): value is Category {
  return typeof value === "string" && value in CATEGORY_LABEL;
}

export default async function Page({ searchParams }: PageProps<"/properties">) {
  const { category: value } = await searchParams;
  const category = isCategory(value) ? value : "all";

  const properties = await fetchProperties(category);

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
