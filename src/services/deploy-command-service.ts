import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import {
  WeaponClasses,
  WeaponDamageType,
  WeaponRarity,
  WeaponTypes,
} from "../models/commands/search-command";
import { WeaponTables } from "./weapon-db-service";

export default function deployCommands() {
  if (process.env.DISCORD_BOT_TOKEN && process.env.CLIENT_ID) {
    const rest = new REST({ version: "9" }).setToken(
      process.env.DISCORD_BOT_TOKEN
    );
    let commands = buildCommands();
    let guildIds = loadGuilds();
    for (const id of guildIds) {
      rest
        .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, id), {
          body: commands,
        })
        .then(() =>
          console.log(
            "Successfully registered application commands for guild " + id
          )
        )
        .catch((err: any) => {
          console.error(err.stack);
        });
    }
  } else {
    throw Error(
      "Configuration is not valid. Check DISCORD_BOT_TOKEN and CLIENT_ID"
    );
  }
}

function loadGuilds(): string[] {
  let guildCount = 0;
  if (process.env.NUM_GUILDS != null) {
    guildCount = parseInt(process.env.NUM_GUILDS);
  } else {
    throw Error("Configuration is not valid. Check NUM_GUILDS");
  }

  let guildIds: string[] = [];
  for (let i = 1; i < guildCount + 1; i++) {
    const id = process.env["GUILD_ID_" + i.toString()];
    if (id) {
      guildIds.push(id);
    } else {
      throw Error(
        `Configuration is not valid. Check ${"GUILD_ID_" + i.toString()}`
      );
    }
  }

  return guildIds;
}

function buildCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("weapon")
      .setDescription("Get information about a weapon")
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName("input")
          .setDescription("Name of weapon")
          .setRequired(true)
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option
          .setName("full")
          .setDescription("Get all perks and stats for the weapon")
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option
          .setName("default")
          .setDescription("Get the default rolls for a weapon")
      )
      .addBooleanOption((option: SlashCommandBooleanOption) =>
        option.setName("stats").setDescription("Get the stats for a weapon")
      ),
    new SlashCommandBuilder()
      .setName("compare")
      .setDescription("Compare stats between 2 weapons")
      .addStringOption((option: SlashCommandStringOption) =>
        option
          .setName("input")
          .setDescription("Name of 2 weapons separated by a comma")
          .setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("mod")
      .setDescription("Get information about a mod")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of mod").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("perk")
      .setDescription("Get information about a perk")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of perk").setRequired(true)
      ),
  ];
  let searchBuilder = new SlashCommandBuilder()
    .setName("search")
    .setDescription("Search for weapons with specific perks");
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("class").setDescription("Search by weapon class");
    for (let weaponType of WeaponClasses)
      option.addChoice(weaponType, weaponType);
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option
      .setName("type")
      .setDescription("Search by weapon type: Kinetic, Energy, Power");
    for (let weaponType of WeaponTypes)
      option.addChoice(weaponType, weaponType);
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("rarity").setDescription("Search by weapon rarity");
    for (let rarity of WeaponRarity) option.addChoice(rarity, rarity);
    return option;
  });
  searchBuilder.addStringOption((option: SlashCommandStringOption) => {
    option.setName("damage").setDescription("Search by weapon damage type");
    for (let damage of WeaponDamageType) option.addChoice(damage, damage);
    return option;
  });

  for (let tableName of WeaponTables) {
    searchBuilder.addStringOption((option: SlashCommandStringOption) =>
      option.setName(tableName).setDescription("Search by " + tableName)
    );
  }
  commands.push(searchBuilder);

  return commands.map((command) => command.toJSON());
}
