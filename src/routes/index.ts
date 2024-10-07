// Import Hono and other dependencies
import { Hono } from "hono";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "../controllers/PostController";
import { bearerAuth } from "hono/bearer-auth";
import { getCookie } from "hono/cookie";
import { verify, JwtPayload } from "jsonwebtoken"; // Import JwtPayload untuk Type Assertion
import { logger } from "hono/logger";

// Initialize router
const router = new Hono();

router.use(logger());
// Middleware to verify token
router.use(
  "*",
  bearerAuth({
    verifyToken: async (token, ctx) => {
      const secret = Bun.env.JWT_SECRET || "secret";
      const cookieToken = getCookie(ctx, "token");

      if (token !== cookieToken) return false; // Tokens do not match

      try {
        const decoded = verify(token, secret) as JwtPayload; // Use Type Assertion

        const currentTime = Math.floor(Date.now() / 1000);

        // Check if the token has expired
        return decoded.exp !== undefined && decoded.exp > currentTime;
      } catch {
        return false; // Token is invalid
      }
    },
  })
);

// Routes for posts
router.get("/", getPosts);
router.get("/:title", getPosts);
router.post("/", createPost);
router.put("/", updatePost);
router.delete("/:id", deletePost);

export const Routes = router;
