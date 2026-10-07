import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setFilter } from "@/store/slices/todoSlice";

export default function TodoFilters() {
  const dispatch = useAppDispatch();
  const { filter, items } = useAppSelector((state) => state.todos);

  const todoItems = Array.isArray(items) ? items : []; // Saftey check-check item is in array

  const filters: Array<{
    value: "all" | "active" | "completed";
    label: string;
  }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ];

  const activeCount = todoItems.filter((t) => !t.completed).length;
  const completedCount = todoItems.filter((t) => t.completed).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => dispatch(setFilter(f.value))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-600">
        <div>
          <span className="font-semibold text-gray-900">{items.length}</span>{" "}
          total
        </div>
        <div>
          <span className="font-semibold text-primary-600">{activeCount}</span>{" "}
          active
        </div>
        <div>
          <span className="font-semibold text-green-600">{completedCount}</span>{" "}
          completed
        </div>
      </div>
    </div>
  );
}
