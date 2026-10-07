import request from "supertest";
import { app } from "../app";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";

let authToken: string;
let userId: string;

// Setup and teardown
beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

beforeEach(async () => {
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0");
  await AppDataSource.getRepository(Todo).clear();
  await AppDataSource.getRepository(User).clear();
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");

  const response = await request(app).post("/api/auth/register").send({
    email: "todouser@example.com",
    password: "password123",
    name: "Todo User",
  });

  authToken = response.body.token;
  userId = response.body.user.id;
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

describe("GET /api/todos", () => {
  it("should return empty array when no todos exist", async () => {
    const response = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.todos).toEqual([]);
  });

  it("should return user's todos", async () => {
    await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Sprint meeting" });

    await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "UI update" });

    const response = await request(app)
      .get("/api/todos")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.todos).toHaveLength(2);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).get("/api/todos");

    expect(response.status).toBe(401);
  });
});

describe("POST /api/todos", () => {
  it("should create a new todo", async () => {
    const response = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Backend Security update",
        description: "Backend Security update",
      });

    expect(response.status).toBe(201);
    expect(response.body.todo).toHaveProperty("id");
    expect(response.body.todo).toHaveProperty(
      "title",
      "Backend Security update",
    );
    expect(response.body.todo).toHaveProperty(
      "description",
      "Backend Security update",
    );
    expect(response.body.todo).toHaveProperty("completed", false);
    expect(response.body.todo).toHaveProperty("userId", userId);
  });

  it("should create todo without description", async () => {
    const response = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Fix testing issues",
      });

    expect(response.status).toBe(201);
    expect(response.body.todo).toHaveProperty("title", "Fix testing issues");
    expect(response.body.todo.description).toBeNull();
  });

  it("should return 400 if title is missing", async () => {
    const response = await request(app)
      .post("/api/todos")
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .post("/api/todos")
      .send({ title: "Test" });

    expect(response.status).toBe(401);
  });
});

describe("PUT /api/todos/:id", () => {
  it("should update a todo", async () => {
    const todoRepo = AppDataSource.getRepository(Todo);
    const todo = await todoRepo.save({
      title: "Original title",
      userId,
      completed: false,
    });

    const response = await request(app)
      .put(`/api/todos/${todo.id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Updated title",
        completed: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.todo).toHaveProperty("title", "Updated title");
    expect(response.body.todo).toHaveProperty("completed", true);
  });

  it("should return 404 for non-existent todo", async () => {
    const response = await request(app)
      .put("/api/todos/non-existent-id")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Updated" });

    expect(response.status).toBe(404);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app)
      .put("/api/todos/some-id")
      .send({ title: "Updated" });

    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/todos/:id", () => {
  it("should delete a todo", async () => {
    const todoRepo = AppDataSource.getRepository(Todo);
    const todo = await todoRepo.save({
      title: "To Delete",
      userId,
      completed: false,
    });

    const response = await request(app)
      .delete(`/api/todos/${todo.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Todo deleted successfully",
    );

    // Verify it's deleted
    const deletedTodo = await todoRepo.findOne({ where: { id: todo.id } });
    expect(deletedTodo).toBeNull();
  });

  it("should return 404 for non-existent todo", async () => {
    const response = await request(app)
      .delete("/api/todos/non-existent-id")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(404);
  });

  it("should return 401 without auth token", async () => {
    const response = await request(app).delete("/api/todos/some-id");

    expect(response.status).toBe(401);
  });
});
