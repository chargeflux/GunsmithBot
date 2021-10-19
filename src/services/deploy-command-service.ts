import {
  SlashCommandStringOption,
  SlashCommandBuilder,
} from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

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
          console.error(err);
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
      ),
    new SlashCommandBuilder()
      .setName("compare")
      .setDescription("Compare stats between 2 weapons"),
    new SlashCommandBuilder()
      .setName("default")
      .setDescription("Get default rolls for a weapon"),
    new SlashCommandBuilder()
      .setName("full")
      .setDescription("Get the full information about a weapon"),
    new SlashCommandBuilder()
      .setName("mod")
      .setDescription("Get information about a mod"),
    new SlashCommandBuilder()
      .setName("perk")
      .setDescription("Get information about a perk")
      .addStringOption((option: SlashCommandStringOption) =>
        option.setName("input").setDescription("Name of perk").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("search")
      .setDescription("Search for weapons with specific perks"),
    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Get the stats information about weapons"),
  ].map((command) => command.toJSON());

  return commands;
}
