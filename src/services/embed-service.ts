import { MessageEmbed } from "discord.js";
import Perk from "../models/destiny-entities/perk";
import { DISCORD_BG_HEX } from "../models/constants";
import { Weapon } from "../models/destiny-entities/weapon";

export function createPerkEmbed(perkResult: Perk): MessageEmbed {
  console.log("Constructing perk embed");
  const description: string =
    "**" + perkResult.name + "**\n" + perkResult.description;
  let embed = new MessageEmbed()
    .setTitle(perkResult.category)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(perkResult.icon);

  return embed;
}

export function createWeaponEmbed(weaponResult: Weapon): MessageEmbed {
  console.log("Constructing weapon embed");
  const description: string =
    weaponResult.baseArchetype?.toString() +
    "\n" +
    weaponResult.baseArchetype?.intrinsic.name;
  let embed = new MessageEmbed()
    .setTitle(weaponResult.name)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(weaponResult.icon);

  if (weaponResult.sockets.length <= 2) {
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

  let lightGGURL = "https://www.light.gg/db/items/" + weaponResult.hash;
  let endingTextComponents = [
    `[Screenshot](${weaponResult.screenshot})`,
    `[light.gg](${lightGGURL})`,
  ];
  let endingText = endingTextComponents.join(" • ");
  embed.addField("\u200b", endingText, false);
  console.log("Sending weapon result");

  return embed;
}
