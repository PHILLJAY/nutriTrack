import {
  Client,
  GatewayIntentBits,
  Events,
  Attachment,
  SlashCommandBuilder,
  REST,
  Routes,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { saveImageFromUrl } from "./image-store";
import { analyzeMealImage, nlpEditMeal } from "./gemini";
import { prisma } from "./db";
import { calculateHealthRating } from "./health-rating";
import { startOfDay, endOfDay } from "date-fns";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// Slash command definitions
const commands = [
  new SlashCommandBuilder()
    .setName("link")
    .setDescription("Get your Discord ID to link your NutriTrack account"),
  new SlashCommandBuilder()
    .setName("status")
    .setDescription("See today's nutrition progress"),
  new SlashCommandBuilder()
    .setName("log")
    .setDescription("Log a meal by description")
    .addStringOption((opt) =>
      opt
        .setName("meal")
        .setDescription("Describe what you ate, e.g. '2 eggs and toast'")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("type")
        .setDescription("Meal type")
        .addChoices(
          { name: "Breakfast", value: "breakfast" },
          { name: "Lunch", value: "lunch" },
          { name: "Dinner", value: "dinner" },
          { name: "Snack", value: "snack" }
        )
    ),
  new SlashCommandBuilder()
    .setName("meals")
    .setDescription("See your recent meals"),
];

export function createDiscordBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
  });

  // Register slash commands on startup
  client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Discord bot logged in as ${readyClient.user.tag}`);
    try {
      const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);
      await rest.put(Routes.applicationCommands(readyClient.user.id), {
        body: commands.map((c) => c.toJSON()),
      });
      console.log("Slash commands registered");
    } catch (err) {
      console.error("Failed to register slash commands:", err);
    }
  });

  // Handle slash commands
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
      switch (interaction.commandName) {
        case "link":
          await handleLink(interaction);
          break;
        case "status":
          await handleStatus(interaction);
          break;
        case "log":
          await handleLog(interaction);
          break;
        case "meals":
          await handleMeals(interaction);
          break;
      }
    } catch (error) {
      console.error(`Error handling /${interaction.commandName}:`, error);
      const reply = {
        content: "Something went wrong. Try again or log the meal on the web app.",
        ephemeral: true,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  // Handle image messages (photo-based meal logging)
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const imageAttachments = message.attachments.filter((att) =>
      ALLOWED_IMAGE_TYPES.includes(att.contentType || "")
    );

    if (imageAttachments.size === 0) return;

    // Find user by discord ID
    const user = await prisma.user.findUnique({
      where: { discordId: message.author.id },
    });

    if (!user) {
      await message.reply(
        "I don't have your account linked yet!\n\n" +
          `Your Discord ID is: \`${message.author.id}\`\n` +
          "Use `/link` for instructions, or go to the NutriTrack web app → Settings."
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
          "Sorry, I had trouble analyzing that image. Try again or log it on the web app."
        );
      }
    }
  });

  return client;
}

// --- Slash command handlers ---

async function handleLink(interaction: ChatInputCommandInteraction) {
  await interaction.reply({
    content:
      `Your Discord ID: \`${interaction.user.id}\`\n\n` +
      `Paste this into **NutriTrack → Settings → Discord User ID** to link your account.`,
    ephemeral: true,
  });
}

async function handleStatus(interaction: ChatInputCommandInteraction) {
  const user = await prisma.user.findUnique({
    where: { discordId: interaction.user.id },
  });

  if (!user) {
    await interaction.reply({
      content:
        "Your account isn't linked yet! Use `/link` to get your Discord ID.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const now = new Date();
  const meals = await prisma.meal.findMany({
    where: {
      userId: user.id,
      eatenAt: { gte: startOfDay(now), lte: endOfDay(now) },
    },
  });

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calPct = Math.round(
    (totals.calories / user.targetCalories) * 100
  );

  const embed = new EmbedBuilder()
    .setTitle("Today's Progress")
    .setColor(calPct > 100 ? 0xef4444 : 0x22c55e)
    .addFields(
      {
        name: "Calories",
        value: `${totals.calories} / ${user.targetCalories} kcal (${calPct}%)`,
        inline: false,
      },
      {
        name: "Protein",
        value: `${Math.round(totals.protein)}g / ${user.targetProtein}g`,
        inline: true,
      },
      {
        name: "Carbs",
        value: `${Math.round(totals.carbs)}g / ${user.targetCarbs}g`,
        inline: true,
      },
      {
        name: "Fat",
        value: `${Math.round(totals.fat)}g / ${user.targetFat}g`,
        inline: true,
      },
      { name: "Meals logged", value: `${meals.length}`, inline: true }
    )
    .setFooter({ text: "NutriTrack" });

  await interaction.editReply({ embeds: [embed] });
}

async function handleLog(interaction: ChatInputCommandInteraction) {
  const user = await prisma.user.findUnique({
    where: { discordId: interaction.user.id },
  });

  if (!user) {
    await interaction.reply({
      content:
        "Your account isn't linked yet! Use `/link` to get your Discord ID.",
      ephemeral: true,
    });
    return;
  }

  const mealDescription = interaction.options.getString("meal", true);
  const mealType = interaction.options.getString("type") || "snack";

  await interaction.deferReply();

  try {
    const analysis = await analyzeMealDescription(mealDescription, mealType);
    const healthRating = calculateHealthRating(analysis);

    await prisma.meal.create({
      data: {
        userId: user.id,
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
      },
    });

    await interaction.editReply({
      content: formatMealReply({ ...analysis, healthRating }),
    });
  } catch (error) {
    console.error("Error logging meal:", error);
    await interaction.editReply({
      content: "Couldn't analyze that meal. Try being more specific, or log it on the web app.",
    });
  }
}

async function handleMeals(interaction: ChatInputCommandInteraction) {
  const user = await prisma.user.findUnique({
    where: { discordId: interaction.user.id },
  });

  if (!user) {
    await interaction.reply({
      content:
        "Your account isn't linked yet! Use `/link` to get your Discord ID.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const meals = await prisma.meal.findMany({
    where: { userId: user.id },
    orderBy: { eatenAt: "desc" },
    take: 5,
  });

  if (meals.length === 0) {
    await interaction.editReply("No meals logged yet. Send me a photo or use `/log`!");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("Recent Meals")
    .setColor(0x3b82f6)
    .setDescription(
      meals
        .map((m) => {
          const time = new Date(m.eatenAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `**${m.name}** (${time}) — ${m.calories} kcal`;
        })
        .join("\n")
    )
    .setFooter({ text: "NutriTrack" });

  await interaction.editReply({ embeds: [embed] });
}

// --- Helpers ---

interface ProcessedMeal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  healthRating: number;
  mealType: string;
  notes: string;
}

async function processMealImage(
  attachment: Attachment,
  userId: string
): Promise<ProcessedMeal> {
  const { buffer, filename, path, mimeType } = await saveImageFromUrl(
    attachment.url,
    attachment.name
  );

  const analysis = await analyzeMealImage(buffer, mimeType);

  const image = await prisma.image.create({
    data: { userId, filename, path, mimeType, size: buffer.length },
  });

  const healthRating = calculateHealthRating(analysis);

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

async function analyzeMealDescription(
  description: string,
  mealType: string
): Promise<ProcessedMeal> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const prompt = `The user describes their meal as: "${description}"
Meal type: ${mealType}

Return ONLY a valid JSON object (no markdown, no code fences):
{
  "name": "descriptive meal name",
  "calories": number,
  "protein": grams,
  "carbs": grams,
  "fat": grams,
  "fiber": grams,
  "sugar": grams,
  "sodium": mg,
  "healthRating": 0-100,
  "mealType": "${mealType}",
  "notes": "brief description"
}

Be realistic with estimates. Rate healthiness 0-100.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse response");

  return JSON.parse(jsonMatch[0]) as ProcessedMeal;
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

  return [
    `Oh nice, that looks like a **${meal.name}**!`,
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
