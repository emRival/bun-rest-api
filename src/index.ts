import { Hono } from "hono";

import { Routes } from "./routes";
import { Users } from "./routes/users";
import { Images } from "./routes/image";

const app = new Hono().basePath("/api");

app.route("/posts", Routes);
app.route("/images", Images);
app.route("/users", Users);

export default app;
