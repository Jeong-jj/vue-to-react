import { useEffect, useRef } from "react";

export const SearchInput = (
  required: boolean = true,
  updateInput: (value: string) => void,
) => {
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
      {required && (
        <button type="button" onClick={() => updateInput("")}>
          지우기
        </button>
      )}
    </div>
  );
};
