import Layout from "@/components/layout/Layout";
import TodoForm from "@/components/todos/ToDoForm";
import TodoFilters from "@/components/todos/TodoFilters";
import TodoList from "@/components/todos/ToDoList";

export default function DashboardPage() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Todos</h1>
          <p className="text-gray-600 mt-2">Stay organized and productive</p>
        </div>

        {/* Add Todo Form */}
        <TodoForm />

        {/* Filters & Stats */}
        <TodoFilters />

        {/* Todo List */}
        <TodoList />
      </div>
    </Layout>
  );
}
