import { Context, Hono } from "hono";
import { z } from "zod";
import prisma from "../../prisma/client";

import { sign } from "hono/jwt";

import { setCookie, getCookie } from "hono/cookie";

// Schema validasi menggunakan Zod
const schema = z.object({
  username: z.string().email(),
  password: z
    .string()
    .min(6)
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&#^()\-+_.]{6,}$/, {
      message:
        "Password must contain at least one letter, one number, and can include special characters",
    }),
});

// POST /register
export const register = async (ctx: Context) => {
  try {
    // Ambil data dari request body
    const body = await ctx.req.parseBody();

    // Validasi data menggunakan schema Zod
    const data = schema.parse(body);

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    if (existingUser) {
      return ctx.json(
        {
          success: false,
          message: "Email has already taken", // Email sudah digunakan
        },
        400
      );
    }

    // Hash password sebelum menyimpannya
    const hashedPassword = await Bun.password.hash(data.password);

    // Membuat user baru di database menggunakan Prisma
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
      },
    });

    // Kembalikan response JSON sukses
    return ctx.json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    // Jika error berasal dari validasi Zod
    if (error instanceof z.ZodError) {
      return ctx.json(
        {
          success: false,
          message: error.errors[0].message, // Menampilkan pesan error dari Zod
        },
        400
      );
    }

    // Jika error berasal dari Prisma atau error lainnya
    return ctx.json(
      {
        success: false,
        message: "An error occurred",
        error: error instanceof Error ? error.message : "Unknown error", // Menampilkan error message
      },
      500
    );
  }
};

export const login = async (ctx: Context) => {
  try {
    // Ambil data dari request body
    const body = await ctx.req.parseBody();

    // Validasi data menggunakan schema Zod
    const data = schema.parse(body);

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    });

    // Jika user tidak ditemukan
    if (!user) {
      return ctx.json(
        {
          success: false,
          message: "User or Password incorrect", // User tidak ditemukan
        },
        404
      );
    }

    // Bandingkan password yang diinputkan dengan password di database
    const passwordMatch = await Bun.password.verify(
      data.password,
      user.password
    );

    // Jika user dan password tidak ditemukan
    if (!passwordMatch) {
      return ctx.json(
        {
          success: false,
          message: "User or Password incorrect", // User tidak ditemukan
        },
        404
      );
    }

    const payload = {
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 1,
    };

    // Generate token JWT

    const token = await sign(payload, Bun.env.JWT_SECRET!);
    setCookie(ctx, "token", token, {
      secure: true, // Pastikan cookie hanya dikirim melalui HTTPS
      maxAge: 60, // Durasi cookie dalam detik (5 menit)
      sameSite: "Lax",
    });
    return ctx.json({
      payload,
      token,
    });
  } catch (error) {
    // Jika error berasal dari validasi Zod
    if (error instanceof z.ZodError) {
      return ctx.json(
        {
          success: false,
          message: error.errors[0].message, // Menampilkan pesan error dari Zod
        },
        400
      );
    }

    // Jika error berasal dari Prisma atau error lainnya
    return ctx.json(
      {
        success: false,
        message: "An error occurred",
        error: error instanceof Error ? error.message : "Unknown error", // Menampilkan error message
      },
      500
    );
  }
};
