"use client";

interface Props {
  error: Error;
  reset: () => void;
}

export default function Error(props: Props) {
  const { error, reset } = props;

  return (
    <div>
      <p>{error.message}</p>
      <button type="button" onClick={reset}>
        다시 시도
      </button>
    </div>
  );
}
