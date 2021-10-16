const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

export default function deployCommands() {
  const rest = new REST({ version: "9" }).setToken(
    process.env.DISCORD_BOT_TOKEN
  );
  let commands = buildCommands();
  let guild_ids = loadGuilds();
  for (const id of guild_ids) {
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
}

function loadGuilds(): string[] {
  let guild_count = 0;
  if (process.env.NUM_GUILDS != null) {
    guild_count = parseInt(process.env.NUM_GUILDS);
  } else {
    throw Error("Configuration is not valid. Check NUM_GUILDS");
  }

  const guild_ids: string[] = [];
  for (let i = 1; i < guild_count + 1; i++) {
    const id = process.env["GUILD_ID_" + i.toString()];
    if (id) {
      guild_ids.push(id);
    } else {
      throw Error(
        `Configuration is not valid. Check ${"GUILD_ID_" + i.toString()}`
      );
    }
  }

  return guild_ids;
}

function buildCommands(): string[] {
  const commands: string[] = [
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
      .setDescription("Get information about a perk"),
    new SlashCommandBuilder()
      .setName("search")
      .setDescription("Search for weapons with specific perks"),
    new SlashCommandBuilder()
      .setName("stats")
      .setDescription("Get the stats information about weapons"),
  ].map((command) => command.toJSON());

  return commands;
}
