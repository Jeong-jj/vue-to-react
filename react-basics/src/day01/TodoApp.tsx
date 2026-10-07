import { useState } from "react";

type Filter = "all" | "active" | "done";
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function TodoApp() {
  // 진짜 state는 "원본 데이터 + 사용자 선택값" 3개뿐
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  // computed 자리: 컴포넌트 함수가 렌더링마다 다시 실행되므로 그냥 변수로 계산하면 항상 최신값
  // (useState + useEffect로 만들면 "렌더 → effect → setState → 또 렌더"로 한 박자 늦고,
  //  effect 안에서 setTodos(todos.filter(...))는 매번 새 배열이라 무한 렌더링이 됨)
  const filteredTodos =
    filter === "active"
      ? todos.filter((t) => !t.done)
      : filter === "done"
        ? todos.filter((t) => t.done)
        : todos;

  const remainingCount = todos.filter((t) => !t.done).length;

  // DOM 전역 Event가 아니라 React가 넘겨주는 합성 이벤트 타입을 받는다
  function addTodo(event: React.SubmitEvent<HTMLFormElement>) {
    // preventDefault "호출"을 해야 함. 안 하면 form 제출로 페이지가 새로고침돼서 추가한 todo가 사라짐
    event.preventDefault();

    const text = input.trim();
    if (!text) return;
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput("");
  }

  function removeTodo(id: number) {
    // splice는 원본을 변경하고 "삭제된 요소들"을 반환함 → 삭제한 항목만 남는 버그
    // 원본은 두고 새 배열을 만든다
    setTodos(todos.filter((t) => t.id !== id));
  }

  function toggleTodo(id: number) {
    // 객체를 직접 바꾸면 todos 참조가 그대로라 React는 변경을 모름 → 리렌더링 안 됨
    // 바뀌는 항목만 새 객체로 교체한 새 배열을 setTodos에 넘긴다
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  return (
    <>
      <h1>Todo</h1>

      <form onSubmit={addTodo}>
        <input
          value={input}
          placeholder="할 일을 입력하세요"
          // v-model 자리: onChange + e.target.value (InputEvent.data는 방금 입력한 글자 하나뿐)
          onChange={(event) => setInput(event.target.value)}
        />
        <button type="submit">추가</button>
      </form>

      <div>
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            // `${cond && "active"}`는 false일 때 "false"라는 클래스가 들어감
            className={filter === f ? "active" : undefined}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <p>남은 할 일 {remainingCount}개</p>

      {!filteredTodos.length ? (
        <p>할 일이 없습니다</p>
      ) : (
        <ul>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className={todo.done ? "done" : undefined}>
                {todo.text}
              </span>
              <button onClick={() => removeTodo(todo.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
