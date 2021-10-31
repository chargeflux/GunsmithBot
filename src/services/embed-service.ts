import { MessageEmbed } from "discord.js";
import CompareCommand from "../models/commands/compare-command";
import SearchCommand from "../models/commands/search-command";
import { WeaponCommandOptions } from "../models/commands/weapon-command";
import { DISCORD_BG_HEX } from "../models/constants";
import Mod from "../models/destiny-entities/mod";
import Perk from "../models/destiny-entities/perk";
import { Weapon } from "../models/destiny-entities/weapon";
import { logger } from "./logger-service";

const _logger = logger.getChildLogger({ name: "Embed" });

export function createPerkEmbed(perkResult: Perk): MessageEmbed {
  _logger.info("Constructing perk embed");
  const embed = new MessageEmbed()
    .setTitle(perkResult.category)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(perkResult.icon);
  embed.addField(perkResult.name, perkResult.description);
  _logger.info("Returning embed");
  return embed;
}

export function createModEmbed(modResult: Mod): MessageEmbed {
  _logger.info("Constructing mod embed");
  const embed = new MessageEmbed()
    .setTitle(modResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(modResult.icon);
  if (modResult.source)
    embed.addField(
      modResult.overview,
      "_" + modResult.source + "_\n" + modResult.description
    );
  else embed.addField(modResult.overview, modResult.description);
  _logger.info("Returning embed");
  return embed;
}

export function createCompareEmbed(
  processedCommand: CompareCommand
): MessageEmbed {
  _logger.info("Constructing compare embed");
  const embed = new MessageEmbed().setColor(DISCORD_BG_HEX);
  embed.addField(
    processedCommand.results[0].name,
    processedCommand.generateStatDiffString(0),
    true
  );
  embed.addField("Stats", processedCommand.statNames, true);
  embed.addField(
    processedCommand.results[1].name,
    processedCommand.generateStatDiffString(1),
    true
  );

  _logger.info("Returning embed");
  return embed;
}

export function createWeaponEmbed(
  weaponResult: Weapon,
  options: WeaponCommandOptions
): MessageEmbed {
  let embed;
  if (options.full) embed = createFullWeaponEmbed(weaponResult);
  else if (options.stats) embed = createStatsWeaponEmbed(weaponResult);
  else {
    _logger.info("Constructing weapon embed");
    const description: string =
      weaponResult.baseArchetype?.toString() +
      "\n" +
      weaponResult.baseArchetype?.intrinsic?.name;
    embed = new MessageEmbed()
      .setTitle(weaponResult.name)
      .setDescription(description)
      .setColor(DISCORD_BG_HEX)
      .setThumbnail(weaponResult.icon);

    if (weaponResult.sockets.length <= 2 || options.isDefault) {
      for (const socket of weaponResult.sockets) {
        embed.addField("**" + socket.name + "**", socket.toString(), true);
      }
    } else {
      for (const socket of weaponResult.sockets) {
        if (socket.name == "Traits") {
          embed.addField("**" + socket.name + "**", socket.toString(), true);
        }
      }
    }
  }

  const lightGGURL = "https://www.light.gg/db/items/" + weaponResult.hash;
  const endingTextComponents = [
    `[Screenshot](${weaponResult.screenshot})`,
    `[light.gg](${lightGGURL})`,
  ];
  const endingText = endingTextComponents.join(" • ");
  embed.addField("\u200b", endingText, false);
  _logger.info("Returning embed");

  return embed;
}

function createFullWeaponEmbed(weaponResult: Weapon): MessageEmbed {
  _logger.info("Constructing full weapon embed");
  const description: string =
    weaponResult.baseArchetype?.toString() +
    "\n" +
    weaponResult.baseArchetype?.intrinsic?.name +
    "\n" +
    weaponResult.flavorText;
  const embed = new MessageEmbed()
    .setTitle(weaponResult.name)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  if (!weaponResult.stats)
    throw Error("Weapon has no stats. Aborting embed creation.");
  const STATS = weaponResult.stats.stats.map((x) => x.toString()).join("\n");
  if (weaponResult.sockets.length <= 2) {
    for (const socket of weaponResult.sockets) {
      embed.addField("**" + socket.name + "**", socket.toString(), true);
    }
    embed.addField("**Stats**", STATS, true);
  } else {
    let fieldIdx = 0;
    for (const socket of weaponResult.sockets) {
      if ((fieldIdx + 1) % 3 == 0) {
        if (fieldIdx + 1 == 3) embed.addField("**Stats**", STATS, true);
        else embed.addField("\u200b", "\u200b", true);
        fieldIdx += 1;
      }
      embed.addField("**" + socket.name + "**", socket.toString(), true);
      fieldIdx += 1;
    }
    embed.addField("\u200b", "\u200b", true);
  }
  return embed;
}

function createStatsWeaponEmbed(weaponResult: Weapon): MessageEmbed {
  _logger.info("Constructing stats of weapon embed");
  const embed = new MessageEmbed()
    .setTitle(weaponResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  if (!weaponResult.stats)
    throw Error("Weapon has no stats. Aborting embed creation.");
  const STATS = weaponResult.stats.stats.map((x) => x.toString()).join("\n");
  embed.addField("**Stats**", STATS, true);
  return embed;
}

export function createSearchEmbed(searchCommand: SearchCommand, cnt: number) {
  _logger.info("Constructing search embed");
  const embed = new MessageEmbed()
    .setTitle("Weapon Results")
    .setDescription(cnt.toString() + " weapons found")
    .setFooter(searchCommand.input)
    .setColor(DISCORD_BG_HEX);

  for (const weaponClass in searchCommand.results) {
    embed.addField(
      weaponClass,
      searchCommand.results[weaponClass]
        .sort()
        .map((x) => {
          if (x.powerCap) return "~~" + x.name + "~~";
          else return x.name;
        })
        .join("\n"),
      true
    );
  }

  embed.fields = embed.fields.sort((a, b) =>
    a.name > b.name ? 1 : a.name < b.name ? -1 : 0
  );
  return embed;
}
