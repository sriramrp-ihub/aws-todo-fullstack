import { Router } from "express";
import { body } from "express-validator";
import { todoController } from "../controllers/todoController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

const createTodoValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("description").optional().trim(),
];

const updateTodoValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("description").optional().trim(),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
];

router.use(authenticate); // All routes require authentication

// my Routes
router.get("/", todoController.getTodos);
router.post("/", createTodoValidation, todoController.createTodo);
router.put("/:id", updateTodoValidation, todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

export default router;
