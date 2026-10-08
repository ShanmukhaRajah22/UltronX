import { Router } from "express";

import {
  register,
  login,
  getProfile,
} from "./user.controller.js";

import { authenticate } from "../../middleware/auth.js";

const router = Router();

/** Registers a new user account. */
router.post(
  "/register",

  register
);

/** Authenticates an existing user. */
router.post(
  "/login",
  login
);

/** Returns the authenticated user's profile. */
router.get(
  "/me",
  authenticate,
  getProfile
);

export default router;