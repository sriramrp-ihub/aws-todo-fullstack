import { Router } from "express";
import { body } from "express-validator";
import { authController } from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

const registerValidation = [
  body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name cannot be empty"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Must be a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, authController.register);
router.post("/login", loginValidation, authController.login);
router.get("/me", authenticate, authController.me);
router.post("/logout", authController.logout);

export default router;
