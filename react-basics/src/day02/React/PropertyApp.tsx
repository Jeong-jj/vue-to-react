import { useEffect, useState } from "react";
import type { Category } from "../types";
import { properties } from "../data";
import { useEscapeKey } from "./useEscapeKey";
import { SearchInput } from "./SearchInput";
import { CategoryFilter } from "./CategoryFilter";
import { ItemList } from "./ItemList";
import { ItemDetail } from "./ItemDetail";

export const PropertyApp = () => {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filteredItems = properties.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      p.title.includes(keyword.trim()),
  );

  const selectedItem = properties.find((p) => p.id === selectedId) ?? null;

  const selectCategory = (category: Category | "all") => {
    setCategory(category);
    setSelectedId(null);
  };

  useEscapeKey(() => {
    setSelectedId(null);
  });

  return (
    <>
      <h1>매물 검색</h1>

      <SearchInput value={keyword} updateInput={setKeyword} />
      <CategoryFilter selected={category} onChange={selectCategory} />

      <p>{filteredItems.length}</p>

      <ItemList
        items={filteredItems}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />

      {selectedItem && (
        <ItemDetail item={selectedItem}>
          <button type="button" onClick={() => setSelectedId(null)}>
            닫기
          </button>
        </ItemDetail>
      )}
    </>
  );
};
