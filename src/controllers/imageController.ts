import { Context, Hono } from "hono";
import sharp from "sharp";
import prisma from "../../prisma/client";

// image upload convert to base64
export const postImage = async (ctx: Context) => {
    try {
      const { image: file } = await ctx.req.parseBody();
  
      if (!file || typeof file === "string") {
        throw new Error("Invalid file");
      }
  
      // Compress the image using sharp (reduce size and quality)
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const compressedImageBuffer = await sharp(fileBuffer)
        .resize({ width: 800 }) // Resize image to 800px width (adjust as needed)
        .jpeg({ quality: 80 })  // Compress to JPEG with 80% quality (adjust as needed)
        .toBuffer();
  
      // Convert to base64
      const base64 = compressedImageBuffer.toString("base64");
  
      // Save to the database
      const saveFile = await prisma.image.create({
        data: { image: base64 },
      });
  
      return ctx.json({
        success: true,
        message: "File uploaded and compressed successfully",
        data: saveFile,
      });
    } catch (error) {
      return ctx.json(
        {
          success: false,
          message: (error instanceof Error ? error.message : "An error occurred"),
        },
        500
      );
    }
  };