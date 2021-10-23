import Discord from "discord.js";
import dotenv from "dotenv";
import ModController from "./controllers/mod-controller";
import PerkController from "./controllers/perk-controller";
import SearchController from "./controllers/search-controller";
import WeaponController from "./controllers/weapon-controller";
import CompareCommand from "./models/commands/compare-command";
import WeaponCommand from "./models/commands/weapon-command";
import Mod from "./models/destiny-entities/mod";
import Perk from "./models/destiny-entities/perk";
import { Weapon } from "./models/destiny-entities/weapon";
import deployCommands from "./services/deploy-command-service";
import {
  createCompareEmbed,
  createModEmbed,
  createPerkEmbed,
  createSearchEmbed,
  createWeaponEmbed,
} from "./services/embed-service";
import ManifestDBService from "./services/manifest-db-service";
import { getInventoryItemsByHashes } from "./services/manifest/inventory-item-service";
import {
  getCurrentVersion,
  updateManifest,
} from "./services/manifest/manifest-service";
import WeaponDBService from "./services/weapon-db-service";
dotenv.config();

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

let perkController: PerkController;
let weaponController: WeaponController;
let modController: ModController;
let searchController: SearchController;

client.once("ready", async () => {
  console.log("Ready!");
  let dbService = new ManifestDBService();
  try {
    await updateManifest(dbService).then(async (toChange: boolean) => {
      perkController = new PerkController();
      weaponController = new WeaponController();
      modController = new ModController();
      searchController = new SearchController();
      if (toChange) {
        let tables = await searchController.createWeaponTables(
          weaponController
        );
        new WeaponDBService().construct(tables);
        searchController = new SearchController();
      }
    });
  } catch (e: any) {
    console.error(e.stack);
    console.error("Failed to check or update manifest");
    if (!(await getCurrentVersion()))
      throw Error("Failed to retrieve manifest data. Shutting down.");
    perkController = new PerkController();
    weaponController = new WeaponController();
    modController = new ModController();
    searchController = new SearchController();
  }
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
    if (inputString?.length < 3 && commandName != "search") {
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
        let weaponCommand: WeaponCommand | undefined =
          await weaponController.processWeaponCommand(
            inputString,
            interaction.options
          );
        if (weaponCommand) {
          let results = weaponCommand.weaponResults;
          if (results.length != 0) {
            console.log(
              results.length,
              "results found!:",
              results.map((x) => x.name).join(", ")
            );
            let embed = createWeaponEmbed(results[0], weaponCommand?.options);
            console.log("Sending weapon result");
            interaction.editReply({ embeds: [embed] });
          } else {
            interaction.editReply("No results found. Please try again");
          }
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "mod": {
        console.log(`Searching for '${inputString}'`);
        let results: Mod[] = await modController.processModCommand(inputString);
        if (results.length != 0) {
          console.log(
            results.length,
            "results found!:",
            results.map((x) => x.name).join(", ")
          );
          let embed = createModEmbed(results[0]);
          console.log("Sending mod result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "compare": {
        console.log(`Comparing '${inputString}'`);
        let parsedValues = inputString.split(",").map((x) => x.trim());
        if (parsedValues.length != 2) {
          interaction.editReply("Please enter only 2 weapons");
          return;
        }
        let compareWeapons: Weapon[] = [];
        for (let value of parsedValues) {
          let weaponCommand = await weaponController.processWeaponCommand(
            value,
            interaction.options
          );
          if (weaponCommand && weaponCommand.weaponResults)
            compareWeapons.push(weaponCommand.weaponResults[0]);
        }
        let processedCommand = new CompareCommand(inputString, compareWeapons);
        if (processedCommand.weaponStatDiff) {
          let embed = createCompareEmbed(processedCommand);
          console.log("Sending compare result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "search": {
        console.log("Performing Search");
        let searchCommand = await searchController.processSearchCommand(
          interaction.options
        );
        let cnt = searchCommand.getCount();
        if (cnt != 0) {
          let embed = createSearchEmbed(searchCommand, cnt);
          console.log("Sending search result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      default:
        interaction.editReply("Command has not been implemented yet.");
    }
  } catch (err: any) {
    console.error(err.stack);
    interaction.editReply(
      "Failed to process command: **" + commandName + "**. Please try again."
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#close---this
process.on("exit", () => {
  perkController.dbService.close();
  weaponController.dbService.close();
  modController.dbService.close();
  searchController.dbService.close();
  searchController.weaponDBService.close();
});
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
