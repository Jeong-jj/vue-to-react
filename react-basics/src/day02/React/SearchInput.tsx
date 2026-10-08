import { useEffect, useRef } from "react";

interface Props {
  value: string;
  updateInput: (value: string) => void;
}

export const SearchInput = ({ value, updateInput }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <div>
      <input
        ref={inputRef}
        onChange={(e) => updateInput(e.target.value)}
        placeholder="매물명 검색"
      />
      {value && (
        <button type="button" onClick={() => updateInput("")}>
          지우기
        </button>
      )}
    </div>
  );
};
