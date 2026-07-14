import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function saveImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ filename: string; path: string }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}`);
  }
  if (buffer.length > MAX_SIZE) {
    throw new Error(`Image too large: ${buffer.length} bytes`);
  }

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = response.headers.get("content-type") || "image/jpeg";

    const { filename, path } = await saveImage(buffer, originalFilename, mimeType);

    return { buffer, filename, path, mimeType };
  } finally {
    clearTimeout(timeout);
  }
}
