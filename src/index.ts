import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
import deployCommands from "./services/deploy-command-service";
import processPerkCommand from "./controllers/perk-controller";
import { createPerkEmbed } from "./services/embed-service";

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
  await interaction.deferReply();
  try {
    switch (commandName) {
      case "perk": {
        var results = await processPerkCommand(
          interaction.options.getString("input") ?? ""
        );
        if (results.length != 0) {
          let embed = createPerkEmbed(results[0]);
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      default:
        interaction.editReply("Command has not been implemented yet.");
    }
  } catch (err) {
    console.log(err);
    interaction.editReply(
      "Failed to process command: **" + commandName + "**. Please try again."
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
