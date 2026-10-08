import type { Property } from "../types";
import { ItemCard } from "./ItemCard";

interface Props {
  items: Property[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export const ItemList = ({ items, selectedId, onSelect }: Props) => {
  return (
    <>
      {items.length === 0 ? (
        <p>검색 결과가 없습니다.</p>
      ) : (
        <ul>
          {items.map((item) => (
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
