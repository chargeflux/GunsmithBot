import dotenv from "dotenv";
dotenv.config();
import Discord from "discord.js";
import deployCommands from "./services/deploy-command-service";
import processPerkCommand from "./controllers/perk-controller";
import { createPerkEmbed, createWeaponEmbed } from "./services/embed-service";
import processWeaponCommand from "./controllers/weapon-controller";
import { Weapon } from "./models/destiny-entities/weapon";
import Perk from "./models/destiny-entities/perk";

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
    let inputString = interaction.options.getString("input") ?? "";
    if (inputString?.length < 3) {
      console.error(inputString, "is 3 characters or less");
      interaction.editReply("Please enter a query of 3 or more characters!");
      return;
    }
    inputString = inputString.replace("’", "'");
    switch (commandName) {
      case "perk": {
        console.log(`Searching for '${inputString}'`);
        let results: Perk[] = await processPerkCommand(inputString);
        if (results.length != 0) {
          console.log(
            results.length,
            "results found!:",
            results.map((x) => x.name).join(", ")
          );
          let embed = createPerkEmbed(results[0]);
          console.log("Sending perk result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "weapon": {
        console.log(`Searching for '${inputString}'`);
        let results: Weapon[] = await processWeaponCommand(inputString);
        if (results.length != 0) {
          console.log(
            results.length,
            "results found!:",
            results.map((x) => x.name).join(", ")
          );
          let embed = createWeaponEmbed(results[0]);
          console.log("Sending weapon result");
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
