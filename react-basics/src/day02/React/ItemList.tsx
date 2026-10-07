import type { Property } from "../types";
import { ItemCard } from "./ItemCard";

export const ItemList = (
  items: Property[],
  selectedId: number | null,
  onSelect: (id: number) => void,
) => {
  return (
    <>
      {items.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <ul>
          {items.map((item) => (
            /* 무슨 이슈인지 체크 필요, props 전달이 제대로 안됨 */
            <ItemCard
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              onClick={() => onSelect(item.id)}
            />
          ))}
        </ul>
      )}
    </>
  );
};
