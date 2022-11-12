import {
  REST,
  Routes,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import {
  WeaponClasses,
  WeaponDamageType,
  WeaponRarity,
  WeaponSlots,
} from "../models/commands/searchCommand";
import { WeaponTables } from "../services/weaponDbService";
import { logger } from "../logger";
import ConfigurationError from "../models/errors/configurationError";

const _logger = logger.getChildLogger({ name: "Deploy" });

export default function deployCommands() {
  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_BOT_CLIENT_ID) {
    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_BOT_TOKEN);
    const commands = buildCommands();
    const guildIds = loadGuilds();
    for (const id of guildIds) {
      rest
        .put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_CLIENT_ID, id), {
          body: commands,
        })
        .then(() => _logger.info("Successfully registered application commands for guild " + id))
        .catch((err) => {
          _logger.error("Failed to deploy commands", err);
        });
    }
  } else {
    throw new ConfigurationError("Check DISCORD_BOT_TOKEN and DISCORD_BOT_CLIENT_ID");
  }
}

function loadGuilds(): string[] {
  if (process.env.GUILD_IDS != null) {
    const guilds = JSON.parse(process.env.GUILD_IDS);
    if (guilds.length === 0) {
      throw new ConfigurationError("GUILD_IDS must have at least one id");
    }
    return guilds;
  } else {
    throw new ConfigurationError("Check GUILD_IDS");
  }
}

function buildCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("weapon")
      .setDescription("Get information about a weapon")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of weapon").setRequired(true)
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option.setName("full").setDescription("Get all perks and stats for the weapon")
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option.setName("default").setDescription("Get the default rolls for a weapon")
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option.setName("stats").setDescription("Get the stats for a weapon")
      ),
    new SlashCommandBuilder()
      .setName("compare")
      .setDescription("Compare stats between 2 weapons")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input_a").setDescription("Name of weapon").setRequired(true)
      )
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input_b").setDescription("Name of weapon").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("mod")
      .setDescription("Get information about a mod")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of mod").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("armor")
      .setDescription("Get information about an armor piece")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of armor").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("perk")
      .setDescription("Get information about a perk")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of perk").setRequired(true)
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option.setName("enhanced").setDescription("Get the enhanced version of the perk")
      ),
  ];
  const searchBuilder = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for weapons with specific perks");
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("class").setDescription("Search by weapon class");
    for (const weaponType of WeaponClasses)
      option.addChoices({ name: weaponType, value: weaponType });
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("slot").setDescription("Search by weapon slot");
    for (const weaponSlot of WeaponSlots)
      option.addChoices({ name: weaponSlot, value: weaponSlot });
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("rarity").setDescription("Search by weapon rarity");
    for (const rarity of WeaponRarity) option.addChoices({ name: rarity, value: rarity });
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("damage").setDescription("Search by weapon damage type");
    for (const damage of WeaponDamageType) option.addChoices({ name: damage, value: damage });
    return option;
  });

  for (const tableName of WeaponTables) {
    searchBuilder.addStringOption((option: SlashCommandStringOption) =>
      option.setName(tableName).setDescription("Search by " + tableName)
    );
  }
  commands.push(searchBuilder);

  return commands.map((command) => command.toJSON());
}
