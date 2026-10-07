import { CATEGORY_LABEL, type Property } from "../types";

export const ItemCard = (item: Property, selected: boolean) => {
  const priceLabel = `${item.deposit.toLocaleString()} / ${item.monthlyRent}`;

  return (
    <li className={selected ? "selected" : ""}>
      <strong>{item.title}</strong>
      <span>{CATEGORY_LABEL[item.category]}</span>
      <span>{priceLabel}</span>
    </li>
  );
};
