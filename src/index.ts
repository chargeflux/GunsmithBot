import dotenv from "dotenv";
dotenv.config();
import CompareCommand from "./models/commands/compareCommand";
import PublicError from "./models/errors/publicError";
import createEmbed, { EmbedPayload } from "./discord/createEmbed";
import { logger } from "./logger";
import BaseClient from "./discord/baseClient";
import { BaseDestinyItem } from "./models/destiny-entities/baseMetadata";
import { CommandInteraction, Events } from "discord.js";
import { QueryType } from "./models/constants";
import WeaponOptions from "./models/command-options/weaponOptions";

const _logger = logger.getSubLogger({ name: "Main" });

const baseClient = new BaseClient();
const discordClient = baseClient.client;

function logQueryResults(results: BaseDestinyItem[]) {
  _logger.info(results.length + " results found!: " + results.map((x) => x.name).join(", "));
}

async function sendEmbed(
  interaction: CommandInteraction,
  payloads: EmbedPayload,
  queryType: QueryType
) {
  _logger.info(`Sending ${queryType} result`);
  if (payloads.files) {
    await interaction.editReply({ embeds: [payloads.embed], files: [payloads.files] });
  } else {
    await interaction.editReply({ embeds: [payloads.embed] });
  }
}

discordClient.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.isChatInputCommand()) return;
  const commandName = interaction.commandName;
  try {
    await interaction.deferReply();
  } catch (err) {
    _logger.error("Failed to defer reply for interaction", err);
    return;
  }

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
          const embed = await createEmbed(QueryType.Perk, perkCommand);
          await sendEmbed(interaction, embed, QueryType.Perk);
        } else {
          await interaction.editReply("No results found");
        }
        return;
      }
      case "weapon": {
        _logger.info(`Searching for '${inputString}'`);
        const parsedOptions = WeaponOptions.parseDiscordInteractionOptions(interaction.options);
        const weaponCommand = await baseClient.weaponController.processWeaponQuery(
          inputString,
          parsedOptions
        );
        if (weaponCommand && weaponCommand.count) {
          logQueryResults(weaponCommand.results);
          const embed = await createEmbed(QueryType.Weapon, weaponCommand);
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
          const embed = await createEmbed(QueryType.Armor, armorCommand);
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
          const embed = await createEmbed(QueryType.Mod, modCommand);
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
        const parsedOptions = WeaponOptions.parseDiscordInteractionOptions(interaction.options);
        const weaponA = (
          await baseClient.weaponController.processWeaponQuery(inputA, parsedOptions)
        )?.results[0];
        const weaponB = (
          await baseClient.weaponController.processWeaponQuery(inputB, parsedOptions)
        )?.results[0];

        if (weaponA && weaponB) {
          const processedCommand = new CompareCommand(inputA + ", " + inputB, weaponA, weaponB);
          if (processedCommand.weaponStatDiff) {
            const embed = createEmbed(QueryType.Compare, processedCommand);
            sendEmbed(interaction, await embed, QueryType.Compare);
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
          _logger.info("Search query -", searchCommand.input);
          const embed = createEmbed(QueryType.Search, searchCommand);
          sendEmbed(interaction, await embed, QueryType.Search);
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
    if (Object.prototype.hasOwnProperty.call(err, "errors")) {
      for (const error of (err as unknown as { errors: [] }).errors) {
        _logger.error(error);
      }
    }

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
