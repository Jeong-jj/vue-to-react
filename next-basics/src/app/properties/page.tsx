import { fetchProperties } from "@/lib/api";
import { Category, CATEGORY_LABEL, Property } from "@/lib/types";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchValue = (await searchParams).category;
  const category =
    typeof searchValue === "string" && searchValue in CATEGORY_LABEL
      ? (searchValue as Category)
      : "all";

  // 처음 시도했던 코드: async 내에서 useState 사용불가
  // const [properties, setProperties] = useState<Property[]>([]);

  // 재시도한 코드: 여전히 에러 발생, state와 useEffect의 대체 방법을 못떠올림
  let loading: boolean = false;
  let error: Error | null = null;
  let properties: Property[] = [];

  async function load() {
    loading = true;
    error = null;

    try {
      properties = await fetchProperties(category);
    } catch (e) {
      error = e as Error;
    } finally {
      loading = false;
    }
  }

  await load();

  return (
    <>
      <h1>매물 목록</h1>

      <nav>
        <Link href={{ query: {} }}>전체</Link>
        {Object.entries(CATEGORY_LABEL).map(([label, key]) => (
          <Link key={key} href={{ query: { category: key } }}>
            {label}
          </Link>
        ))}
      </nav>

      {loading ? (
        <p>목록을 불러오는 중...</p>
      ) : error ? (
        <div>
          <p>{error.message}</p>
          <button type="button" onClick={load}>
            다시 시도
          </button>
        </div>
      ) : !properties.length ? (
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
