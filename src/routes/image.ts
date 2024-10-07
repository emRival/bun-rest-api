import { Hono } from "hono";
import { logger } from "hono/logger";
import { postImage } from "../controllers/imageController";




//inistialize router
const router = new Hono();



router.use(logger());
router.post("/", (c) => postImage(c));




export const Images = router;
