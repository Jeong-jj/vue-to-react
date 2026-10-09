import { useEffect, useState } from "react";

// watch를 useEffect로 옮긴 버전 vs 이벤트 핸들러에서 처리한 버전의 렌더링 비교
// 사용법: src/App.tsx에서 <WatchVsHandler />를 렌더링하고 개발자 도구 콘솔을 연다

type Category = "all" | "apartment" | "officetel";

const ITEMS = [
  { id: 1, title: "역삼 래미안", category: "apartment" },
  { id: 2, title: "성수 오피스텔", category: "officetel" },
] as const;

// 선택된 매물의 상세를 "조회"하는 자식 (실제라면 API 요청)
function Detail({ tag, id, category }: { tag: string; id: number; category: Category }) {
  useEffect(() => {
    const item = ITEMS.find((i) => i.id === id);
    console.log(`%c[${tag}]    📡 Detail effect: category=${category}, 매물=${item?.title}`, "color:#d97706");
  }, [tag, id, category]);

  return <p>상세: 매물 {id}</p>;
}

function Controls({
  tag,
  category,
  selectedId,
  onCategory,
  onSelect,
}: {
  tag: string;
  category: Category;
  selectedId: number | null;
  onCategory: (c: Category) => void;
  onSelect: (id: number) => void;
}) {
  return (
    <>
      <div>
        {(["all", "apartment", "officetel"] as Category[]).map((c) => (
          <button
            key={c}
            type="button"
            style={{ fontWeight: category === c ? "bold" : undefined }}
            onClick={() => {
              console.log(`%c[${tag}] ── click: category → ${c}`, "color:#888");
              onCategory(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            style={{ fontWeight: selectedId === item.id ? "bold" : undefined }}
            onClick={() => {
              console.log(`%c[${tag}] ── click: 매물 ${item.id} 선택`, "color:#888");
              onSelect(item.id);
            }}
          >
            {item.title}
          </button>
        ))}
      </div>
    </>
  );
}

function EffectVersion() {
  const [category, setCategory] = useState<Category>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  console.log(`[effect]  render  category=${category}, selectedId=${selectedId}`);

  useEffect(() => {
    console.log(`%c[effect]    ↳ useEffect([category]) 실행 → setSelectedId(null)`, "color:#dc2626");
    // oxlint-disable-next-line react/set-state-in-effect -- 비교를 위해 일부러 남긴 패턴
    setSelectedId(null);
  }, [category]);

  return (
    <section>
      <h2>A. useEffect로 처리 (watch 직역)</h2>
      <Controls
        tag="effect"
        category={category}
        selectedId={selectedId}
        onCategory={setCategory}
        onSelect={setSelectedId}
      />
      {selectedId !== null && <Detail tag="effect" id={selectedId} category={category} />}
    </section>
  );
}

function HandlerVersion() {
  const [category, setCategory] = useState<Category>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  console.log(`[handler] render  category=${category}, selectedId=${selectedId}`);

  const selectCategory = (c: Category) => {
    setCategory(c);
    setSelectedId(null);
  };

  return (
    <section>
      <h2>B. 이벤트 핸들러에서 처리</h2>
      <Controls
        tag="handler"
        category={category}
        selectedId={selectedId}
        onCategory={selectCategory}
        onSelect={setSelectedId}
      />
      {selectedId !== null && <Detail tag="handler" id={selectedId} category={category} />}
    </section>
  );
}

export default function WatchVsHandler() {
  return (
    <>
      <EffectVersion />
      <hr />
      <HandlerVersion />
    </>
  );
}
