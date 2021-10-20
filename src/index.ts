import Discord from "discord.js";
import dotenv from "dotenv";
import PerkController from "./controllers/perk-controller";
import WeaponController from "./controllers/weapon-controller";
import Perk from "./models/destiny-entities/perk";
import { Weapon } from "./models/destiny-entities/weapon";
import DBService from "./services/db-service";
import deployCommands from "./services/deploy-command-service";
import { createPerkEmbed, createWeaponEmbed } from "./services/embed-service";
import { updateManifest } from "./services/manifest/manifest-service";
dotenv.config();

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

let perkController: PerkController;
let weaponController: WeaponController;
let dbService: DBService;

client.once("ready", async () => {
  console.log("Ready!");
  dbService = new DBService();
  await updateManifest(dbService).then(() => {
    perkController = new PerkController(dbService);
    weaponController = new WeaponController(dbService);
  });
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
        let results: Perk[] = await perkController.processPerkCommand(
          inputString
        );
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
        let results: Weapon[] = await weaponController.processWeaponCommand(
          inputString
        );
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

// https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#close---this
process.on("exit", () => dbService.close());
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
