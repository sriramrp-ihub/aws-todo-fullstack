import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { todosApi } from "@/services/api";
import type { Todo } from "@/types/index";
import { AxiosError } from "axios";

// Define the shape of todos state
export interface TodosState {
  items: Todo[];
  isLoading: boolean;
  error: string | null;
  filter: "all" | "active" | "completed";
}

// Initial state
const initialState: TodosState = {
  items: [],
  isLoading: false,
  error: null,
  filter: "all",
};

// Async thunk to fetch all todos
export const fetchTodos = createAsyncThunk(
  "todos/fetchTodos",
  async (_, { rejectWithValue }) => {
    try {
      const response = await todosApi.getAll();
      return response;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch todos",
      );
    }
  },
);

// Async thunk to create a new todo
export const createTodo = createAsyncThunk(
  "todos/createTodo",
  async (
    todoData: { title: string; description?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await todosApi.create(todoData);
      return response;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to create todo",
      );
    }
  },
);

// Async thunk to update a todo
export const updateTodo = createAsyncThunk(
  "todos/updateTodo",
  async (
    { id, data }: { id: string; data: Partial<Todo> },
    { rejectWithValue },
  ) => {
    try {
      const response = await todosApi.update(id, data);
      return response;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to update todo",
      );
    }
  },
);

// Async thunk to delete a todo
export const deleteTodo = createAsyncThunk(
  "todos/deleteTodo",
  async (id: string, { rejectWithValue }) => {
    try {
      await todosApi.delete(id);
      return id;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete todo",
      );
    }
  },
);

// Async thunk to toggle todo completion
export const toggleTodo = createAsyncThunk(
  "todos/toggleTodo",
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { todos: TodosState };
      const todo = state.todos.items.find((t) => t.id === id);

      if (!todo) {
        throw new Error("Todo not found");
      }

      const response = await todosApi.update(id, {
        completed: !todo.completed,
      });
      return response;
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return rejectWithValue(
        error.response?.data?.message || "Failed to toggle todo",
      );
    }
  },
);

// Create the slice
const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<"all" | "active" | "completed">,
    ) => {
      state.filter = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch todos
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action: PayloadAction<Todo[]>) => {
        state.isLoading = false;
        state.items = action.payload ? action.payload : [];
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.items = []; // if error reset
      });

    builder
      .addCase(createTodo.pending, (state) => {
        state.error = null;
      })
      .addCase(createTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        state.isLoading = false;
        state.items = [
          action.payload,
          ...(Array.isArray(state.items) ? state.items : []),
        ];
      })
      .addCase(createTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Update todo
    builder
      .addCase(updateTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete todo
    builder
      .addCase(deleteTodo.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Toggle todo
    builder
      .addCase(toggleTodo.fulfilled, (state, action: PayloadAction<Todo>) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(toggleTodo.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, clearError } = todosSlice.actions;
export default todosSlice.reducer;
