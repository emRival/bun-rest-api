import { Hono } from "hono";

import { Routes } from "./routes";
import { Users } from "./routes/users";



const app = new Hono().basePath("/api");

app.route("/posts", Routes);



app.route("/users", Users);

export default app;
