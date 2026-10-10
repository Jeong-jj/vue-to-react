import React, { useState } from "react";
import { CATEGORY_LABEL, type Category } from "../../day02/types";
import type { PropertyInput } from "../api";

interface Props {
  pending: boolean;
  onSubmit: (input: PropertyInput, reset: () => void) => void;
  errorMessage?: string;
}

// props나 state에 의존하지 않으므로 컴포넌트 밖에 둔다 (렌더링마다 다시 만들 필요 없음)
const initialForm = (): PropertyInput => ({
  title: "",
  category: "apartment",
  deposit: 0,
  monthlyRent: 0,
  area: 0,
  description: "",
});

export const PropertyForm = ({
  pending,
  onSubmit,
  errorMessage = "",
}: Props) => {
  // initialForm을 그대로 넘기면 첫 렌더링에만 호출된다 (initialForm()은 매 렌더링 호출 후 버려짐)
  const [form, setForm] = useState<PropertyInput>(initialForm);

  const reset = () => {
    setForm(initialForm());
  };

  const submitFn = (event: React.SubmitEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...form, title: form.title.trim() }, reset);
  };

  return (
    <form onSubmit={submitFn}>
      <h2>매물 등록</h2>
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="매물명"
      />

      {/* value가 없으면 reset 후에도 select는 이전 선택을 그대로 보여준다 */}
      <select
        value={form.category}
        onChange={(e) =>
          setForm({ ...form, category: e.target.value as Category })
        }
      >
        {/* Object.entries + 구조분해. key 타입은 string으로 넓어지므로 필요하면 단언 */}
        {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={form.deposit}
        onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
        placeholder="보증금"
      />
      <input
        type="number"
        value={form.monthlyRent}
        onChange={(e) =>
          setForm({ ...form, monthlyRent: Number(e.target.value) })
        }
        placeholder="월세"
      />
      <input
        type="number"
        value={form.area}
        onChange={(e) => setForm({ ...form, area: Number(e.target.value) })}
        placeholder="면적"
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="설명"
      />

      <button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "등록"}
      </button>
      {errorMessage && <p>{errorMessage}</p>}
    </form>
  );
};
