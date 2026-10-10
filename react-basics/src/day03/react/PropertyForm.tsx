import React, { useState } from "react";
import { CATEGORY_LABEL, type Category } from "../../day02/types";
import type { PropertyInput } from "../api";

interface Props {
  pending: boolean;
  onSubmit: (input: PropertyInput, reset: () => void) => void;
  errorMessage?: string;
}

export const PropertyForm = ({
  pending,
  onSubmit,
  errorMessage = "",
}: Props) => {
  const initialForm = (): PropertyInput => {
    return {
      title: "",
      category: "apartment",
      deposit: 0,
      monthlyRent: 0,
      area: 0,
      description: "",
    };
  };

  const [form, setForm] = useState<PropertyInput>(initialForm());

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

      <select
        onChange={(e) =>
          setForm({ ...form, category: e.target.value as Category })
        }
      >
        {
          // 객체 반복문 이렇게 맞나?
          Object.entries(CATEGORY_LABEL).map((entry) => (
            <option key={entry[0]} value={entry[0] as Category}>
              {entry[1]}
            </option>
          ))
        }
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
