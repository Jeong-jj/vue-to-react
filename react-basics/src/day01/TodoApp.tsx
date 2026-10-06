import { useEffect, useState } from "react";

type Filter = "all" | "active" | "done";
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState<string>("");
  const [filter, setFilter] = useState<Filter>("all");

  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [remainingCount, setRemainingCount] = useState<number>(0);

  useEffect(() => {
    if (filter === "active") {
      setTodos(todos.filter((t) => !t.done));
      return;
    } else if (filter === "done") {
      setFilteredTodos(todos.filter((t) => t.done));
      return;
    } else {
      setFilteredTodos(todos);
      return;
    }
  }, [filter, todos]);

  useEffect(() => {
    setRemainingCount(todos.filter((t) => !t.done).length);
  }, [todos]);

  function addTodo(event: Event) {
    event.preventDefault;

    const text = input.trim();
    if (!text) return;
    // add 동작을 안하네,,
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setInput("");
  }

  function removeTodo(id: number) {
    const index = todos.findIndex((t) => t.id === id);
    setTodos(todos.splice(index, 1));
  }

  function toggleTodo(todo: Todo) {
    const index = todos.findIndex((t) => t.id === todo.id);

    if (!todos.length) return;
    // 여기는 setTodos를 쓸 필요가 없는거였나?
    todos[index].done = !todos[index].done;
  }

  return (
    <>
      <h1>Todo</h1>

      <form onSubmit={(event) => addTodo(event as Event)}>
        <input
          value={input}
          placeholder="할 일을 입력하세요"
          onInput={(event) => setInput(event.data)}
        />
        <button type="submit">추가</button>
      </form>

      <div>
        {(["all", "active", "done"] as Filter[]).map((f) => (
          <button
            key={f}
            className={`${filter === f && "active"}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <p>남은 할 일 {remainingCount}</p>

      {!filteredTodos.length ? (
        <p>할 일이 없습니다</p>
      ) : (
        <ul>
          {filteredTodos.map((todo) => (
            <li key={todo.id}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo)}
              />
              <span className={`${todo.done && "done"}`}>{todo.text}</span>
              <button onClick={() => removeTodo(todo.id)}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
