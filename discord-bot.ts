import "dotenv/config";
import { createDiscordBot } from "./src/lib/discord";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.warn("DISCORD_BOT_TOKEN not set — skipping Discord bot");
  process.exit(0);
}

const bot = createDiscordBot();

bot.login(token).catch((err) => {
  console.error("Discord bot failed to login:", err.message);
  process.exit(1);
});

bot.once("ready", () => {
  console.log(`Discord bot logged in as ${bot.user?.tag}`);
});

process.on("SIGINT", () => {
  bot.destroy();
  process.exit(0);
});
