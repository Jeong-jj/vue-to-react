import { useEffect } from "react";

export const useEscapeKey = (handler: () => void) => {
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") handler();
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);

    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  });
};
