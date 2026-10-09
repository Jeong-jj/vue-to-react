import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="매물명 검색"
      />
      {value && (
        <button type="button" onClick={() => onChange("")}>
          지우기
        </button>
      )}
    </div>
  );
};
