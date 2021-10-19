import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { BaseMetadata } from "../commands/base-metadata";
import { BUNGIE_URL_ROOT, PlugCategory } from "../constants";

export default class Perk implements BaseMetadata {
  name: string;
  description: string;
  icon: string;
  category: keyof typeof PlugCategory;
  currentlyCanRoll: boolean;

  constructor(
    rawPerkData: DestinyInventoryItemDefinition,
    category: keyof typeof PlugCategory,
    currentlyCanRoll: boolean = true
  ) {
    this.name = rawPerkData.displayProperties.name;
    this.description = rawPerkData.displayProperties.description;
    this.icon = BUNGIE_URL_ROOT + rawPerkData.displayProperties.icon;
    this.category = category;
    this.currentlyCanRoll = currentlyCanRoll;
  }

  toString() {
    return this.name;
  }
}
