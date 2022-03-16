import dotenv from "dotenv";
import CompareCommand from "./models/commands/compareCommand";
import PublicError from "./models/errors/publicError";
import createEmbed from "./services/embedService";
import { logger } from "./services/loggerService";
import BaseClient from "./baseClient";
import { QueryType } from "./models/queryType";
import { BaseDestinyItem } from "./models/destiny-entities/baseMetadata";
import { CommandInteraction, MessageEmbed } from "discord.js";

const _logger = logger;
dotenv.config();

const baseClient = new BaseClient();
const discordClient = baseClient.client;

function logQueryResults(results: BaseDestinyItem[]) {
  _logger.info(results.length, "results found!:", results.map((x) => x.name).join(", "));
}

async function sendEmbed(
  interaction: CommandInteraction,
  embeds: MessageEmbed[],
  queryType: QueryType
) {
  _logger.info(`Sending ${queryType} result`);
  await interaction.editReply({ embeds: embeds });
}

discordClient.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const commandName = interaction.commandName;
  await interaction.deferReply();
  let inputString = interaction.options.getString("input") ?? "";
  try {
    if (inputString.length < 3 && !["search", "compare"].includes(commandName)) {
      _logger.error(inputString, "is 3 characters or less");
      await interaction.editReply("Please enter a query of 3 or more characters!");
      return;
    }

    inputString = inputString.replace("’", "'");

    switch (commandName) {
      case "perk": {
        _logger.info(`Searching for '${inputString}'`);
        const options = baseClient.perkController.processOptions(interaction.options);
        const perkCommand = await baseClient.perkController.processQuery(inputString, options);
        if (perkCommand && perkCommand.count) {
          logQueryResults(perkCommand.results);
          const embed = createEmbed(QueryType.Perk, perkCommand);
          await sendEmbed(interaction, embed, QueryType.Perk);
        } else {
          await interaction.editReply("No results found");
        }
        return;
      }
      case "weapon": {
        _logger.info(`Searching for '${inputString}'`);
        const weaponCommand = await baseClient.weaponController.processWeaponQuery(
          inputString,
          interaction.options
        );
        if (weaponCommand && weaponCommand.count) {
          logQueryResults(weaponCommand.results);
          const embed = createEmbed(QueryType.Weapon, weaponCommand);
          await sendEmbed(interaction, embed, QueryType.Weapon);
        } else {
          await interaction.editReply("No results found");
        }
        return;
      }
      case "armor": {
        _logger.info(`Searching for '${inputString}'`);
        const armorCommand = await baseClient.armorController.processQuery(inputString);
        if (armorCommand && armorCommand.count) {
          logQueryResults(armorCommand.results);
          const embed = createEmbed(QueryType.Armor, armorCommand);
          sendEmbed(interaction, embed, QueryType.Armor);
        } else {
          await interaction.editReply("No results found");
        }
        return;
      }
      case "mod": {
        _logger.info(`Searching for '${inputString}'`);
        const modCommand = await baseClient.modController.processQuery(inputString);
        if (modCommand && modCommand.count) {
          logQueryResults(modCommand.results);
          const embed = createEmbed(QueryType.Mod, modCommand);
          sendEmbed(interaction, embed, QueryType.Mod);
        } else {
          await interaction.editReply("No results found");
        }
        return;
      }
      case "compare": {
        const inputA = interaction.options.getString("input_a") ?? "";
        const inputB = interaction.options.getString("input_b") ?? "";
        if (inputA.length < 3 || inputB.length < 3) {
          _logger.error(inputA + " or " + inputB + " is 3 characters or less");
          await interaction.editReply("Please enter queries that are 3 or more characters!");
          return;
        }

        _logger.info(`Comparing '${inputA}' and '${inputB}'`);
        const weaponA = (
          await baseClient.weaponController.processWeaponQuery(inputA, interaction.options)
        )?.results[0];
        const weaponB = (
          await baseClient.weaponController.processWeaponQuery(inputB, interaction.options)
        )?.results[0];

        if (weaponA && weaponB) {
          const processedCommand = new CompareCommand(inputA + ", " + inputB, weaponA, weaponB);
          if (processedCommand.weaponStatDiff) {
            const embed = createEmbed(QueryType.Compare, processedCommand);
            sendEmbed(interaction, embed, QueryType.Compare);
          } else {
            _logger.error("No weapon stat diff found");
            await interaction.editReply("Invalid input. Please try again");
          }
        } else {
          _logger.error(
            `One of the weapons were invalid: ${weaponA?.name} - ${inputA}, ${weaponB?.name} - ${inputB}`
          );
          await interaction.editReply("Invalid input. Please try again");
        }
        return;
      }
      case "search": {
        _logger.info("Performing Search");
        const searchCommand = await baseClient.searchController.processSearchQuery(
          interaction.options
        );
        if (searchCommand) {
          const embed = createEmbed(QueryType.Search, searchCommand);
          sendEmbed(interaction, embed, QueryType.Search);
        } else {
          await interaction.editReply("No results found.");
        }
        return;
      }
      default:
        await interaction.editReply("Command has not been implemented yet.");
    }
  } catch (err) {
    _logger.error("Failed to process command '" + commandName + "' with input " + inputString, err);

    if (err instanceof PublicError) {
      await interaction.editReply(err.message);
    } else {
      await interaction.editReply(
        "Failed to process command: **" + commandName + "**. Please try again."
      );
    }
  }
});

// https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#close---this
process.on("exit", () => {
  baseClient.tearDown();
});
process.on("SIGHUP", () => process.exit(128 + 1));
process.on("SIGINT", () => process.exit(128 + 2));
process.on("SIGTERM", () => process.exit(128 + 15));
