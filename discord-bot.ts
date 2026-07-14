import "dotenv/config";
import { createDiscordBot } from "./src/lib/discord";

const bot = createDiscordBot();

bot.login(process.env.DISCORD_BOT_TOKEN);

bot.once("ready", () => {
  console.log(`Discord bot logged in as ${bot.user?.tag}`);
});

process.on("SIGINT", () => {
  bot.destroy();
  process.exit(0);
});
