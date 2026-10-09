import { CATEGORY_LABEL, type Category } from "../types";

interface Props {
  selected: Category | "all";
  onChange: (category: Category | "all") => void;
}

export const CategoryFilter = ({ selected, onChange }: Props) => {
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
          className={selected === option.value ? "selected" : undefined}
        >
          {option.label}
        </button>
      ))}
    </>
  );
};
