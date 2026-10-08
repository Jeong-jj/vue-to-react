import type { ReactNode } from "react";
import { CATEGORY_LABEL, type Property } from "../types";

interface Props {
  item: Property;
  children?: ReactNode;
}

/* children도 props다? type지정이 틀린걸까? */
export const ItemDetail = ({ item, children }: Props) => {
  return (
    <section>
      <h2>{item.title}</h2>
      <dl>
        <dt>유형</dt>
        <dd>{CATEGORY_LABEL[item.category]}</dd>
        <dt>보증금 / 월세</dt>
        <dd>
          {item.deposit.toLocaleString()} / {item.monthlyRent} 만원
        </dd>
        <dt>전용면적</dt>
        <dd>{item.area} m²</dd>
      </dl>
      <p>{item.description}</p>

      <>{children}</>
    </section>
  );
};
