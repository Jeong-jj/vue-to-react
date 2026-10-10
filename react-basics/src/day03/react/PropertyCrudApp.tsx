import { useState } from "react";
import { CATEGORY_LABEL, type Category } from "../../day02/types";
import { setFailMode, type PropertyInput } from "../api";
import {
  useCreateProperty,
  useDeleteProperty,
  useProperties,
  useProperty,
} from "./queries";
import { PropertyForm } from "./PropertyForm";

export const PropertyCrudApp = () => {
  const [category, setCategory] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isFailMode, setIsFailMode] = useState(false);

  const switchFailMode = () => {
    setIsFailMode((prev) => !prev);
    setFailMode(!isFailMode);
  };

  const {
    data: items,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useProperties(category);
  const { data: detail, isPending: isDetailPending } = useProperty(selectedId);

  const createMutation = useCreateProperty();
  const deleteMutation = useDeleteProperty();

  function handleCreate(input: PropertyInput, reset: () => void) {
    createMutation.mutate(input, {
      onSuccess: () => reset(),
    });
  }
  function handleDelete(id: number) {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
      },
    });
  }

  return (
    <>
      <h1>매물 관리</h1>

      <label>
        <input type="checkbox" checked={isFailMode} onChange={switchFailMode} />
        API 실패 모드
      </label>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category | "all")}
      >
        <option value="all">전체</option>
        {Object.entries(CATEGORY_LABEL).map((entry) => (
          <option key={entry[0]} value={entry[0] as Category}>
            {entry[1]}
          </option>
        ))}
      </select>
      {!isPending && isFetching && <span>갱신 중...</span>}

      {/* 목록 */}
      {isPending ? (
        <p>불러오는 중...</p>
      ) : isError ? (
        <div>
          <p>{error?.message}</p>
          <button type="button" onClick={() => refetch()}>
            다시 시도
          </button>
        </div>
      ) : !items?.length ? (
        <p>등록된 매물이 없습니다</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedId(item.id)}>
                {item.title} ({CATEGORY_LABEL[item.category]})
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => handleDelete(item.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 상세 */}
      {selectedId !== null && (
        <section>
          {isDetailPending ? (
            <p>상세 불러오는 중...</p>
          ) : detail ? (
            <div>
              <h2>{detail.title}</h2>
              <p>
                {detail.deposit.toLocaleString()} / {detail.monthlyRent} 만원 ·{" "}
                {detail.area}㎡
              </p>
              <p>{detail.description}</p>
            </div>
          ) : null}
          <button type="button" onClick={() => setSelectedId(null)}>
            닫기
          </button>
        </section>
      )}

      <PropertyForm
        pending={createMutation.isPending}
        errorMessage={createMutation.error?.message}
        onSubmit={handleCreate}
      />
    </>
  );
};
