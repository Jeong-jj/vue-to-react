import { CATEGORY_LABEL, type Property } from "../types";

interface Props {
  item: Property;
  selected: boolean;
  onClick: () => void; /* vue처럼 자동으로 붙지 않는건가 */
}

export const ItemCard = ({ item, selected, onClick }: Props) => {
  const priceLabel = `${item.deposit.toLocaleString()} / ${item.monthlyRent}`;

  return (
    <li onClick={onClick} className={selected ? "selected" : ""}>
      <strong>{item.title}</strong>
      <span>{CATEGORY_LABEL[item.category]}</span>
      <span>{priceLabel}</span>
    </li>
  );
};
