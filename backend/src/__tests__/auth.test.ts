import request from "supertest";
import { app } from "../app";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Todo } from "../entities/Todo";

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log("Database initialized!");
  }
});

beforeEach(async () => {
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 0"); // Temporary false

  // Clear both tables
  await AppDataSource.getRepository(Todo).clear();
  await AppDataSource.getRepository(User).clear();

  // Re-enable foreign key checks
  await AppDataSource.query("SET FOREIGN_KEY_CHECKS = 1");
});

describe("POST /api/auth/register", () => {
  it("should register a new user with valid data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "Password123!",
      name: "Test User",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("email", "test@example.com");
    expect(response.body.user).toHaveProperty("name", "Test User");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should return 400 if email is invalid", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "invalid-email",
      password: "Password123!",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 if password is too short", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });

  it("should return 400 if email already exists", async () => {
    // First registration
    await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "Password123!",
    });

    // Duplicate registration
    const response = await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("already exists");
  });

  it("should hash the password before saving", async () => {
    const password = "Password123!";

    const response = await request(app).post("/api/auth/register").send({
      email: "test@example.com",
      password: password,
    });

    console.log("Response status:", response.status);
    console.log("Response body:", response.body);

    // Check password is hashed in database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email: "test@example.com" },
    });

    console.log("User found:", user);

    expect(user?.password).not.toBe(password);
    expect(user?.password).toMatch(/^\$2[ayb]\$.{56}$/);
  });
});

describe("POST /api/auth/login", () => {
  it("should login with valid credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login@test.com",
      password: "password123",
      name: "Login User",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login@test.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user).toHaveProperty("email", "login@test.com");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should return 401 for wrong password", async () => {
    await request(app).post("/api/auth/register").send({
      email: "wrongpass@test.com",
      password: "correctpassword",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "wrongpass@test.com",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  it("should return 401 for non-existent user", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Invalid credentials");
  });

  it("should return 400 for invalid email format", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "invalid-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("errors");
  });
});

describe("GET /api/auth/me", () => {
  it("should return current user with valid token", async () => {
    const registerResponse = await request(app)
      .post("/api/auth/register")
      .send({
        email: "me@test.com",
        password: "password123",
        name: "aman",
      });

    const token = registerResponse.body.token;

    // current user
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("email", "me@test.com"); // ← Fixed: response.body.user
    expect(response.body.user).toHaveProperty("name", "aman");
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should return 401 without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid-token-here");

    expect(response.status).toBe(401);
  });
});
