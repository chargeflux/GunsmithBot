import { MessageEmbed } from "discord.js";
import { WeaponCommandOptions } from "../models/commands/weapon-command";
import { DISCORD_BG_HEX } from "../models/constants";
import Mod from "../models/destiny-entities/mod";
import Perk from "../models/destiny-entities/perk";
import { Weapon } from "../models/destiny-entities/weapon";

export function createPerkEmbed(perkResult: Perk): MessageEmbed {
  console.log("Constructing perk embed");
  let embed = new MessageEmbed()
    .setTitle(perkResult.category)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(perkResult.icon);
  embed.addField(perkResult.name, perkResult.description);
  console.log("Returning embed");
  return embed;
}

export function createModEmbed(modResult: Mod): MessageEmbed {
  console.log("Constructing mod embed");
  let embed = new MessageEmbed()
    .setTitle(modResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(modResult.icon);
  if (modResult.source)
    embed.addField(
      modResult.overview,
      "_" + modResult.source + "_\n" + modResult.description
    );
  else embed.addField(modResult.overview, modResult.description);
  console.log("Returning embed");
  return embed;
}

export function createWeaponEmbed(
  weaponResult: Weapon,
  options: WeaponCommandOptions
): MessageEmbed {
  let embed;
  if (options.full) embed = constructFullWeaponEmbed(weaponResult);
  else if (options.stats) embed = constructStatsWeaponEmbed(weaponResult);
  else {
    console.log("Constructing weapon embed");
    const description: string =
      weaponResult.baseArchetype?.toString() +
      "\n" +
      weaponResult.baseArchetype?.intrinsic.name;
    embed = new MessageEmbed()
      .setTitle(weaponResult.name)
      .setDescription(description)
      .setColor(DISCORD_BG_HEX)
      .setThumbnail(weaponResult.icon);

    if (weaponResult.sockets.length <= 2 || options.isDefault) {
      for (let socket of weaponResult.sockets) {
        embed.addField("**" + socket.name + "**", socket.toString(), true);
      }
    } else {
      for (let socket of weaponResult.sockets) {
        if (socket.name == "Perks") {
          embed.addField("**" + socket.name + "**", socket.toString(), true);
        }
      }
    }
  }

  let lightGGURL = "https://www.light.gg/db/items/" + weaponResult.hash;
  let endingTextComponents = [
    `[Screenshot](${weaponResult.screenshot})`,
    `[light.gg](${lightGGURL})`,
  ];
  let endingText = endingTextComponents.join(" • ");
  embed.addField("\u200b", endingText, false);
  console.log("Returning embed");

  return embed;
}

function constructFullWeaponEmbed(weaponResult: Weapon): MessageEmbed {
  console.log("Constructing full weapon embed");
  const description: string =
    weaponResult.baseArchetype?.toString() +
    "\n" +
    weaponResult.baseArchetype?.intrinsic.name +
    "\n" +
    weaponResult.flavorText;
  let embed = new MessageEmbed()
    .setTitle(weaponResult.name)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  let STATS = weaponResult.stats.map((x) => x.toString()).join("\n");
  if (weaponResult.sockets.length <= 2) {
    for (let socket of weaponResult.sockets) {
      embed.addField("**" + socket.name + "**", socket.toString(), true);
    }
    embed.addField("**Stats**", STATS, true);
  } else {
    let fieldIdx = 0;
    for (let socket of weaponResult.sockets) {
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
function constructStatsWeaponEmbed(weaponResult: Weapon): MessageEmbed {
  console.log("Constructing stats of weapon embed");
  let embed = new MessageEmbed()
    .setTitle(weaponResult.name)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);
  let STATS = weaponResult.stats.map((x) => x.toString()).join("\n");
  embed.addField("**Stats**", STATS, true);
  return embed;
}
