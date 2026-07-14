import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function saveImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ filename: string; path: string }> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = filename.split(".").pop() || "jpg";
  const uniqueName = `${randomUUID()}.${ext}`;
  const filePath = join(UPLOAD_DIR, uniqueName);

  await writeFile(filePath, buffer);

  return {
    filename: uniqueName,
    path: `/uploads/${uniqueName}`,
  };
}

export async function saveImageFromUrl(
  url: string,
  originalFilename: string
): Promise<{ buffer: Buffer; filename: string; path: string; mimeType: string }> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = response.headers.get("content-type") || "image/jpeg";

  const { filename, path } = await saveImage(buffer, originalFilename, mimeType);

  return { buffer, filename, path, mimeType };
}
