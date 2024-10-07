import { Hono } from "hono";
import { logger } from "hono/logger";
import { login, register } from "../controllers/UserController";



//inistialize router
const router = new Hono();



router.use(logger());
router.post("/register", (c) => register(c));
router.post("/login", (c) => login(c));



export const Users = router;
