import { AppDataSource } from "../config/database";
import { Todo } from "../entities/Todo";

export class TodoService {
  private todoRepository = AppDataSource.getRepository(Todo);

  // Get all todos for a user
  async getTodosByUserId(userId: string) {
    const todos = await this.todoRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
    return todos;
  }

  async createTodo(userId: string, title: string, description?: string) {
    const todo = this.todoRepository.create({
      userId,
      title,
      description,
      completed: false,
    });

    await this.todoRepository.save(todo);
    return todo;
  }

  async updateTodo(todoId: string, userId: string, updates: Partial<Todo>) {
    const todo = await this.todoRepository.findOne({
      where: { id: todoId, userId },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    Object.assign(todo, updates);
    await this.todoRepository.save(todo);

    return todo;
  }

  // Delete a todo
  async deleteTodo(todoId: string, userId: string) {
    const todo = await this.todoRepository.findOne({
      where: { id: todoId, userId },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    await this.todoRepository.remove(todo);
    return { message: "Todo deleted successfully" };
  }

  // Find a todo
  async getTodoById(todoId: string, userId: string) {
    const todo = await this.todoRepository.findOne({
      where: { id: todoId, userId },
    });

    if (!todo) {
      throw new Error("Todo not found");
    }

    return todo;
  }
}

export const todoService = new TodoService();
