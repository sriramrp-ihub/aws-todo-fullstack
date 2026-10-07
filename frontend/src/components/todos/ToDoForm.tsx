import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createTodo } from "@/store/slices/todoSlice";
import { Plus } from "lucide-react";

export default function TodoForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDescription, setShowDescription] = useState(false);
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await dispatch(
      createTodo({
        title: title.trim(),
        description: description.trim() || undefined,
      }),
    );

    // Reset form
    setTitle("");
    setDescription("");
    setShowDescription(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="input flex-1"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={20} />
          <span className="ml-1">Add</span>
        </button>
      </div>

      {showDescription ? (
        <div className="mt-3">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            className="input resize-none"
            rows={2}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className="mt-2 text-sm text-gray-500 hover:text-gray-700"
        >
          + Add description
        </button>
      )}
    </form>
  );
}
