import { Context } from "hono";

import prisma from "../../prisma/client";

// GET /posts
export const getPosts = async (ctx: Context) => {
  try {
    // get all posts filtered by title or get all posts by desc
    const posts = await prisma.post.findMany({
      where: {
        title: ctx.req.param("title") ? ctx.req.param("title") : undefined,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // return json response
    return ctx.json({
      success: true,
      message: "Posts retrieved successfully",
      data: posts,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Posts not found",
      data: [],
    });
  }
};

// POST /posts
export const createPost = async (ctx: Context) => {
  try {
    // get post data from request body
    const body = await ctx.req.parseBody();

    const title = typeof body.title === "string" ? body.title : "";
    const content = typeof body.content === "string" ? body.content : "";

    // create post
    const post = await prisma.post.create({
      data: {
        title: title,
        content: content,
      },
    });

    // return json response
    return ctx.json({
      success: true,
      message: "Post created successfully",
      data: post,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Posts not found",
      data: [],
    });
  }
};

// PUT /posts

export const updatePost = async (ctx: Context) => {
  try {
    // get post data from request body
    const body = await ctx.req.parseBody();
    // id is integer
    const id = typeof body.id === "string" ? body.id : "";
    const title = typeof body.title === "string" ? body.title : "";
    const content = typeof body.content === "string" ? body.content : "";

    // update post
    const post = await prisma.post.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: title,
        content: content,
      },
    });

    // return json response
    return ctx.json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Posts not found",
      data: [],
    });
  }
};

export const deletePost = async (ctx: Context) => {
  try {
    // get id from request params
    const id = ctx.req.param("id");

    // update post
    const post = await prisma.post.delete({
      where: {
        id: parseInt(id),
      },
    });

    // return json response
    return ctx.json({
      success: true,
      message: "Post deleted successfully",
      data: post,
    });
  } catch (error) {
    return ctx.json({
      success: false,
      message: "Posts not found",
      data: [],
    });
  }
};
