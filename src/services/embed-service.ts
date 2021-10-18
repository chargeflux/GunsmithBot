import { MessageEmbed } from "discord.js";
import { PerkInfo } from "../models/commands/perk-command";
import { DISCORD_BG_HEX } from "../models/constants";

export function createPerkEmbed(perk_result: PerkInfo): MessageEmbed {
  const description: string =
    "**" + perk_result.name + "**\n" + perk_result.description;
  let embed = new MessageEmbed()
    .setTitle(perk_result.category)
    .setDescription(description)
    .setColor(DISCORD_BG_HEX)
    .setThumbnail(perk_result.icon);

  return embed;
}
