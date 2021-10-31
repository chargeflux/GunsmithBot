import Discord from "discord.js";
import dotenv from "dotenv";
import cron from "node-cron";
import ModController from "./controllers/mod-controller";
import PerkController from "./controllers/perk-controller";
import SearchController from "./controllers/search-controller";
import WeaponController from "./controllers/weapon-controller";
import CompareCommand from "./models/commands/compare-command";
import WeaponCommand from "./models/commands/weapon-command";
import Mod from "./models/destiny-entities/mod";
import Perk from "./models/destiny-entities/perk";
import deployCommands from "./services/deploy-command-service";
import {
  createCompareEmbed,
  createModEmbed,
  createPerkEmbed,
  createSearchEmbed,
  createWeaponEmbed,
} from "./services/embed-service";
import { logger, rotateLog } from "./services/logger-service";
import ManifestDBService from "./services/manifest-db-service";
import { getInventoryItemsWeapons } from "./services/manifest/inventory-item-service";
import {
  getCurrentVersion,
  updateManifest,
} from "./services/manifest/manifest-service";
import WeaponDBService from "./services/weapon-db-service";
const _logger = logger;
dotenv.config();

const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES],
});

let perkController: PerkController;
let weaponController: WeaponController;
let modController: ModController;
let searchController: SearchController;

async function initializeControllers() {
  const dbService = new ManifestDBService();
  try {
    await updateManifest(dbService).then(async (toChange: boolean) => {
      perkController = new PerkController();
      weaponController = new WeaponController();
      modController = new ModController();
      searchController = new SearchController();
      if (toChange) {
        const weaponItems = await getInventoryItemsWeapons(dbService.db);
        const tables = await searchController.createWeaponTables(weaponItems);
        try {
          new WeaponDBService().construct(tables);
        } catch (e) {
          _logger.fatal("Failed to construct WeaponDB. Shutting down.");
          client.destroy();
          process.exit();
        }
        searchController = new SearchController();
      }
    });
  } catch (e) {
    _logger.error("Failed to check or update manifest", e);
    if (!(await getCurrentVersion())) {
      _logger.fatal("Failed to retrieve manifest data. Shutting down.");
      client.destroy();
      process.exit();
    }
    perkController = new PerkController();
    weaponController = new WeaponController();
    modController = new ModController();
    searchController = new SearchController();
  }
}

function tearDownDatabases() {
  perkController?.dbService.close();
  weaponController?.dbService.close();
  modController?.dbService.close();
  searchController?.dbService.close();
  searchController?.weaponDBService.close();
}

function startCronSchedules() {
  cron.schedule(
    "5 9 * * *",
    async () => {
      _logger.info("Running update");
      rotateLog();
      tearDownDatabases();
      await initializeControllers();
    },
    {
      timezone: "America/Los_Angeles",
    }
  );
}

client.once("ready", async () => {
  rotateLog();
  await initializeControllers();
  startCronSchedules();
  _logger.info("Ready!");
});

client.on("messageCreate", async (message) => {
  if (
    message.content.toLowerCase() === "!deploy" &&
    process.env.APPLICATION_AUTHOR_ID == message.author.id
  )
    try {
      deployCommands();
    } catch (e) {
      _logger.error("Failed to deploy commands", e);
      message.reply("Failed to deploy commands");
    }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const commandName = interaction.commandName;
  await interaction.deferReply();
  let inputString = interaction.options.getString("input") ?? "";
  try {
    if (
      inputString.length < 3 &&
      !["search", "compare"].includes(commandName)
    ) {
      _logger.error(inputString, "is 3 characters or less");
      interaction.editReply("Please enter a query of 3 or more characters!");
      return;
    }
    inputString = inputString.replace("’", "'");
    switch (commandName) {
      case "perk": {
        _logger.info(`Searching for '${inputString}'`);
        const results: Perk[] = await perkController.processPerkCommand(
          inputString
        );
        if (results.length != 0) {
          _logger.info(
            results.length,
            "results found!:",
            results.map((x) => x.name).join(", ")
          );
          const embed = createPerkEmbed(results[0]);
          _logger.info("Sending perk result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "weapon": {
        _logger.info(`Searching for '${inputString}'`);
        const weaponCommand: WeaponCommand | undefined =
          await weaponController.processWeaponCommand(
            inputString,
            interaction.options
          );
        if (weaponCommand) {
          const results = weaponCommand.results;
          if (results.length != 0) {
            _logger.info(
              results.length,
              "results found!:",
              results.map((x) => x.name).join(", ")
            );
            const embed = createWeaponEmbed(results[0], weaponCommand?.options);
            _logger.info("Sending weapon result");
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
        _logger.info(`Searching for '${inputString}'`);
        const results: Mod[] = await modController.processModCommand(
          inputString
        );
        if (results.length != 0) {
          _logger.info(
            results.length,
            "results found!:",
            results.map((x) => x.name).join(", ")
          );
          const embed = createModEmbed(results[0]);
          _logger.info("Sending mod result");
          interaction.editReply({ embeds: [embed] });
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "compare": {
        const inputA = interaction.options.getString("input_a") ?? "";
        const inputB = interaction.options.getString("input_b") ?? "";
        if (inputA.length < 3 || inputB.length < 3) {
          _logger.error(inputA + " or " + inputB + " is 3 characters or less");
          interaction.editReply(
            "Please enter queries that are 3 or more characters!"
          );
          return;
        }
        _logger.info(`Comparing '${inputA}' and '${inputB}'`);
        const weaponA = (
          await weaponController.processWeaponCommand(
            inputA,
            interaction.options
          )
        )?.results[0];
        const weaponB = (
          await weaponController.processWeaponCommand(
            inputB,
            interaction.options
          )
        )?.results[0];
        if (weaponA && weaponB) {
          const processedCommand = new CompareCommand(
            inputA + ", " + inputB,
            weaponA,
            weaponB
          );
          if (processedCommand.weaponStatDiff) {
            const embed = createCompareEmbed(processedCommand);
            _logger.info("Sending compare result");
            interaction.editReply({ embeds: [embed] });
          } else {
            interaction.editReply("Invalid input. Please try again");
          }
        } else {
          interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "search": {
        _logger.info("Performing Search");
        const searchCommand = await searchController.processSearchCommand(
          interaction.options
        );
        const cnt = searchCommand.getCount();
        if (cnt != 0) {
          const embed = createSearchEmbed(searchCommand, cnt);
          _logger.info("Sending search result");
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
    _logger.error(
      "Failed to process command '" +
        commandName +
        "' with input " +
        inputString,
      err
    );
    interaction.editReply(
      "Failed to process command: **" + commandName + "**. Please try again."
    );
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

// https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#close---this
process.on("exit", () => {
  tearDownDatabases();
});
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
