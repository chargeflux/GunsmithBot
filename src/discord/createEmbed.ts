import { APIEmbedField, EmbedBuilder, RestOrArray } from "discord.js";
import ArmorCommand from "../models/commands/armorCommand";
import BaseCommand from "../models/commands/baseCommand";
import CompareCommand from "../models/commands/compareCommand";
import ModCommand from "../models/commands/modCommand";
import PerkCommand from "../models/commands/perkCommand";
import SearchCommand from "../models/commands/searchCommand";
import WeaponCommand, { WeaponCommandOptions } from "../models/commands/weaponCommand";
import { DISCORD_BG_HEX, QueryType } from "../models/constants";
import { Armor } from "../models/destiny-entities/armor";
import { BaseDestinyItem } from "../models/destiny-entities/baseMetadata";
import Mod from "../models/destiny-entities/mod";
import Perk from "../models/destiny-entities/perk";
import { Weapon } from "../models/destiny-entities/weapon";
import { logger } from "../logger";

const _logger = logger.getSubLogger({ name: "Embed" });

export default function createEmbed(
  queryType: QueryType,
  data: BaseCommand<BaseDestinyItem>
): EmbedBuilder[] {
  switch (queryType) {
    case QueryType.Perk: {
      const perkCommand = data as PerkCommand;
      const results = perkCommand.results;
      const embed = createPerkEmbed(results[0]);
      return [embed];
    }
    case QueryType.Weapon: {
      const weaponCommand = data as WeaponCommand;
      const results = weaponCommand.results;
      const embed = createWeaponEmbed(results[0], weaponCommand?.options);
      return [embed];
    }
    case QueryType.Armor: {
      const armorCommand = data as ArmorCommand;
      const results = armorCommand.results;
      const embed = createArmorEmbed(results[0]);
      return [embed];
    }
    case QueryType.Mod: {
      const modCommand = data as ModCommand;
      const results = modCommand.results;
      const embed = createModEmbed(results[0]);
      return [embed];
    }
    case QueryType.Compare: {
      const compareCommand = data as CompareCommand;
      const embed = createCompareEmbed(compareCommand);
      return [embed];
    }
    case QueryType.Search: {
      const searchCommand = data as SearchCommand;
      const embed = createSearchEmbed(searchCommand);
      return [embed];
    }
    default: {
      throw Error(`Query not supported: ${queryType}`);
    }
  }
}

function createPerkEmbed(perkResult: Perk): EmbedBuilder {
  _logger.info("Constructing perk embed");
  const embed = new EmbedBuilder()
    .setTitle(perkResult.category)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(perkResult.icon);
  const name = perkResult.name + (perkResult.isEnhanced ? " (Enhanced)" : "");
  embed.addFields({ name: name, value: perkResult.description });
  _logger.info("Returning embed");
  return embed;
}

function createModEmbed(modResult: Mod): EmbedBuilder {
  _logger.info("Constructing mod embed");
  const embed = new EmbedBuilder()
    .setTitle(modResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(modResult.icon);

  if (modResult.source) embed.addFields({ name: "Source", value: "_" + modResult.source + "_\n" });
  const sections = modResult.sections;
  for (const sectionKey of modResult.getSortedSectionKeys()) {
    if (sectionKey == modResult.name) {
      embed.addFields({
        name: modResult.overview,
        value: sections.get(sectionKey)?.join("\n") ?? "",
      });
    } else {
      embed.addFields({ name: sectionKey, value: sections.get(sectionKey)?.join("\n") ?? "" });
    }
  }
  _logger.info("Returning embed");
  return embed;
}

function createArmorEmbed(armorResult: Armor): EmbedBuilder {
  _logger.info("Constructing armor embed");
  const description: string = armorResult.archetype?.toString() + "\n" + armorResult.flavorText;
  const embed = new EmbedBuilder()
    .setTitle(armorResult.name)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(armorResult.icon);
  _logger.info("Returning embed");
  if (armorResult.source) embed.addFields({ name: "Source", value: armorResult.source });
  if (armorResult.archetype?.intrinsic)
    embed.addFields({
      name: armorResult.archetype.intrinsic.name,
      value: armorResult.archetype.intrinsic.description,
    });
  return embed;
}

function createCompareEmbed(processedCommand: CompareCommand): EmbedBuilder {
  _logger.info("Constructing compare embed");
  const embed = new EmbedBuilder().setColor(DISCORD_BG_HEX);
  embed.addFields({
    name: processedCommand.results[0].name,
    value: processedCommand.generateStatDiffString(0),
    inline: true,
  });
  embed.addFields([
    { name: "Stats", value: processedCommand.statNames, inline: true },
    {
      name: processedCommand.results[1].name,
      value: processedCommand.generateStatDiffString(1),
      inline: true,
    },
  ]);

  _logger.info("Returning embed");
  return embed;
}

function createWeaponEmbed(weaponResult: Weapon, options: WeaponCommandOptions): EmbedBuilder {
  let embed;
  if (options.full) embed = createFullWeaponEmbed(weaponResult);
  else if (options.stats) embed = createStatsWeaponEmbed(weaponResult);
  else {
    _logger.info("Constructing weapon embed");
    const description: string =
      weaponResult.archetype?.toString() + "\n" + weaponResult.archetype?.intrinsic?.name;
    embed = new EmbedBuilder()
      .setTitle(weaponResult.name)
      .setDescription(description)
      .setColor(DISCORD_BG_HEX)
      .setThumbnail(weaponResult.icon);

    if (weaponResult.sockets.length <= 2 || options.isDefault) {
      for (const socket of weaponResult.sockets) {
        embed.addFields({
          name: "**" + socket.name + "**",
          value: socket.toString(),
          inline: true,
        });
      }
    } else {
      for (const socket of weaponResult.sockets) {
        if (socket.name == "Traits") {
          embed.addFields({
            name: "**" + socket.name + "**",
            value: socket.toString(),
            inline: true,
          });
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
  embed.addFields({ name: "\u200b", value: endingText, inline: false });
  _logger.info("Returning embed");

  return embed;
}

function createFullWeaponEmbed(weaponResult: Weapon): EmbedBuilder {
  _logger.info("Constructing full weapon embed");
  const description: string =
    weaponResult.archetype?.toString() +
    "\n" +
    weaponResult.archetype?.intrinsic?.name +
    "\n" +
    weaponResult.flavorText;
  const embed = new EmbedBuilder()
    .setTitle(weaponResult.name)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  if (!weaponResult.stats) throw Error("Weapon has no stats. Aborting embed creation");
  const STATS = weaponResult.stats.stats.map((x) => x.toString()).join("\n");
  if (weaponResult.sockets.length <= 2) {
    for (const socket of weaponResult.sockets) {
      embed.addFields({ name: "**" + socket.name + "**", value: socket.toString(), inline: true });
    }
    embed.addFields({ name: "**Stats**", value: STATS, inline: true });
  } else {
    let fieldIdx = 0;
    for (const socket of weaponResult.sockets) {
      if ((fieldIdx + 1) % 3 == 0) {
        if (fieldIdx + 1 == 3) embed.addFields({ name: "**Stats**", value: STATS, inline: true });
        else embed.addFields({ name: "\u200b", value: "\u200b", inline: true });
        fieldIdx += 1;
      }
      embed.addFields({ name: "**" + socket.name + "**", value: socket.toString(), inline: true });
      fieldIdx += 1;
    }
    embed.addFields({ name: "\u200b", value: "\u200b", inline: true });
  }
  return embed;
}

function createStatsWeaponEmbed(weaponResult: Weapon): EmbedBuilder {
  _logger.info("Constructing stats of weapon embed");
  const embed = new EmbedBuilder()
    .setTitle(weaponResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  if (!weaponResult.stats) throw Error("Weapon has no stats. Aborting embed creation");
  const STATS = weaponResult.stats.stats.map((x) => x.toString()).join("\n");
  embed.addFields({ name: "**Stats**", value: STATS, inline: true });
  return embed;
}

function createSearchEmbed(searchCommand: SearchCommand) {
  _logger.info("Constructing search embed");
  const cnt = searchCommand.getCount();
  const embed = new EmbedBuilder()
    .setTitle("Weapon Results")
    .setDescription(cnt.toString() + " weapons found")
    .setFooter({ text: searchCommand.input })
    .setColor(DISCORD_BG_HEX);
  const fields: APIEmbedField[] = [];
  for (const weaponClass in searchCommand.results) {
    fields.push({
      name: weaponClass,
      value: searchCommand.results[weaponClass]
        .sort()
        .map((x) => {
          if (x.powerCap) return "~~" + x.name + "~~";
          else return x.name;
        })
        .join("\n"),
      inline: true,
    });
  }
  embed.addFields(fields.sort((a, b) => (a.name > b.name ? 1 : a.name < b.name ? -1 : 0)));
  return embed;
}
