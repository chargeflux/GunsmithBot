import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
import deployCommands from "./Services/DeployCommandService";

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  // TODO: condition with application author
  if (message.content.toLowerCase() === "!deploy") deployCommands();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;

  interaction.reply("Acknowledged command " + commandName);
});

client.login(process.env.DISCORD_BOT_TOKEN);
