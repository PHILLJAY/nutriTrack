import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 80;

async function compressImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string; thumbBuffer?: Buffer }> {
  if (mimeType === "image/gif") {
    return { buffer, mimeType };
  }

  try {
    const base = sharp(buffer)
      .rotate() // strip EXIF orientation + metadata
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    // Generate WebP version
    const webp = await base.clone().webp({ quality: 75 }).toBuffer();

    // Generate 600px thumbnail
    const thumb = await base.clone()
      .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 60 })
      .toBuffer();

    return { buffer: webp, mimeType: "image/webp", thumbBuffer: thumb };
  } catch {
    return { buffer, mimeType };
  }
}

export async function saveImage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<{ filename: string; path: string; thumbPath?: string; buffer: Buffer; mimeType: string }> {
  if (!ALLOWED_TYPES.includes(mimeType)) {
    throw new Error(`Invalid image type: ${mimeType}`);
  }
  if (buffer.length > MAX_SIZE) {
    throw new Error(`Image too large: ${buffer.length} bytes`);
  }

  const { buffer: finalBuffer, mimeType: finalMime, thumbBuffer } = await compressImage(buffer, mimeType);

  await mkdir(UPLOAD_DIR, { recursive: true });
  const uniqueName = `${randomUUID()}.webp`;
  const filePath = join(UPLOAD_DIR, uniqueName);

  await writeFile(filePath, finalBuffer);

  let thumbPath: string | undefined;
  if (thumbBuffer) {
    const thumbName = `${randomUUID()}_thumb.webp`;
    await writeFile(join(UPLOAD_DIR, thumbName), thumbBuffer);
    thumbPath = `/uploads/${thumbName}`;
  }

  return {
    filename: uniqueName,
    path: `/uploads/${uniqueName}`,
    thumbPath,
    buffer: finalBuffer,
    mimeType: "image/webp",
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

    const { filename, path, buffer: storedBuffer, mimeType: storedMime } = await saveImage(buffer, originalFilename, mimeType);

    return { buffer: storedBuffer, filename, path, mimeType: storedMime };
  } finally {
    clearTimeout(timeout);
  }
}
