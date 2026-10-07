import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTodos } from "@/store/slices/todoSlice";
import TodoItem from "./TodoItem";
import Spinner from "@/components/common/Spinner";
import Alert from "@/components/common/Alert";

export default function TodoList() {
  const dispatch = useAppDispatch();
  const { items, isLoading, error, filter } = useAppSelector(
    (state) => state.todos,
  );

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  if (isLoading && items.length === 0) {
    return (
      <div className="py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  const todoItems = Array.isArray(items) ? items : []; // Saftey check item is an array

  // Filter todos based on selected filter
  const filteredTodos = todoItems.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true; // 'all'
  });

  if (filteredTodos.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 text-lg">
          {filter === "completed"
            ? "No completed todos yet"
            : filter === "active"
              ? "No active todos"
              : "No todos yet. Create one above! 👆"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </div>
  );
}
