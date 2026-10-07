import { CATEGORY_LABEL, type Category } from "../types";

export const CategoryFilter = (
  selected: Category | "all",
  onChange: (category: Category | "all") => void,
) => {
  const options = [
    { value: "all", label: "전체" },
    ...(Object.keys(CATEGORY_LABEL) as Category[]).map((key) => ({
      value: key,
      label: CATEGORY_LABEL[key],
    })),
  ] as { value: Category | "all"; label: string }[];

  return (
    <>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          onClick={() => onChange(option.value)}
          className={selected === option.value ? "selected" : ""}
        >
          {option.label}
        </button>
      ))}
    </>
  );
};
