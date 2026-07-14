import { Client, GatewayIntentBits, Events, Attachment } from "discord.js";
import { saveImageFromUrl } from "./image-store";
import { analyzeMealImage } from "./gemini";
import { prisma } from "./db";
import { calculateHealthRating } from "./health-rating";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function createDiscordBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    // Check for image attachments
    const imageAttachments = message.attachments.filter((att) =>
      ALLOWED_IMAGE_TYPES.includes(att.contentType || "")
    );

    if (imageAttachments.size === 0) {
      // Handle text commands in DMs
      if (message.channel.isDMBased()) {
        const content = message.content.trim().toLowerCase();

        if (content === "!link" || content === "!id") {
          await message.reply(
            `Your Discord ID is: \`${message.author.id}\`\n\n` +
            `Paste this into the NutriTrack web app to link your account.`
          );
          return;
        }

        // Check if user exists to give better guidance
        const existingUser = await prisma.user.findUnique({
          where: { discordId: message.author.id },
        });

        if (existingUser) {
          await message.reply("Send me a photo of your meal and I'll log it for you!");
        } else {
          await message.reply(
            "I don't have your account linked yet!\n\n" +
            "1. Go to the NutriTrack web app\n" +
            "2. Open Settings and paste this Discord ID:\n" +
            `\`${message.author.id}\`\n\n` +
            "Then send me a meal photo to get started!"
          );
        }
      }
      return;
    }

    // Find user by discord ID
    const user = await prisma.user.findUnique({
      where: { discordId: message.author.id },
    });

    if (!user) {
      await message.reply(
        "I don't have your account linked yet!\n\n" +
        `Your Discord ID is: \`${message.author.id}\`\n` +
        "Go to the NutriTrack web app → Settings → paste this ID to link your account."
      );
      return;
    }

    await message.reply("Let me take a look at that...");

    for (const attachment of imageAttachments.values()) {
      try {
        const result = await processMealImage(attachment, user.id);
        await message.reply({
          content: formatMealReply(result),
          files: [attachment.url],
        });
      } catch (error) {
        console.error("Error processing meal image:", error);
        await message.reply(
          "Sorry, I had trouble analyzing that image. Please try again or log the meal manually on the web app."
        );
      }
    }
  });

  return client;
}

interface ProcessedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  healthRating: number;
  mealType: string;
  notes: string;
}

async function processMealImage(
  attachment: Attachment,
  userId: string
): Promise<ProcessedMeal> {
  // Download and save image
  const { buffer, filename, path, mimeType } = await saveImageFromUrl(
    attachment.url,
    attachment.name
  );

  // Analyze with Gemini
  const analysis = await analyzeMealImage(buffer, mimeType);

  // Save image record
  const image = await prisma.image.create({
    data: {
      userId,
      filename,
      path,
      mimeType,
      size: buffer.length,
    },
  });

  // Calculate health rating
  const healthRating = calculateHealthRating(analysis);

  // Save meal
  await prisma.meal.create({
    data: {
      userId,
      name: analysis.name,
      calories: analysis.calories,
      protein: analysis.protein,
      carbs: analysis.carbs,
      fat: analysis.fat,
      fiber: analysis.fiber,
      sugar: analysis.sugar,
      sodium: analysis.sodium,
      healthRating,
      mealType: analysis.mealType,
      eatenAt: new Date(),
      notes: analysis.notes,
      source: "discord",
      imageId: image.id,
    },
  });

  return {
    name: analysis.name,
    calories: analysis.calories,
    protein: analysis.protein,
    carbs: analysis.carbs,
    fat: analysis.fat,
    fiber: analysis.fiber,
    sugar: analysis.sugar,
    healthRating,
    mealType: analysis.mealType,
    notes: analysis.notes,
  };
}

function formatMealReply(meal: ProcessedMeal): string {
  const healthEmoji =
    meal.healthRating >= 80 ? "🟢" : meal.healthRating >= 50 ? "🟡" : "🔴";

  const healthComment =
    meal.healthRating >= 80
      ? "Solid choice!"
      : meal.healthRating >= 50
      ? "Not bad, could be better."
      : "Treat meal — balance it out later.";

  const mealTypeLabel: Record<string, string> = {
    breakfast: "breakfast",
    lunch: "lunch",
    dinner: "dinner",
    snack: "snack",
  };

  return [
    `Oh nice, that looks like a **${meal.name}** for ${mealTypeLabel[meal.mealType] || "your meal"}!`,
    ``,
    `📊 **${meal.calories}** kcal`,
    `🥩 Protein: **${meal.protein}g** | 🍞 Carbs: **${meal.carbs}g** | 🧈 Fat: **${meal.fat}g**`,
    meal.fiber ? `🌾 Fiber: ${meal.fiber}g` : "",
    meal.sugar ? `🍬 Sugar: ${meal.sugar}g` : "",
    ``,
    `${healthEmoji} Health Rating: **${meal.healthRating}/100** — ${healthComment}`,
    meal.notes ? `> ${meal.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
