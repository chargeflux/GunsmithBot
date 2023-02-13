import { DestinyInventoryItemDefinition, TierType } from "bungie-api-ts/destiny2";
import { logger } from "../../logger";
import { BaseMetadata } from "./baseMetadata";
import { BUNGIE_URL_ROOT, PlugCategory } from "../constants";

const _logger = logger.getSubLogger({ name: "Perk" });

export default class Perk implements BaseMetadata {
  name: string;
  description: string;
  icon: string;
  hash: number;
  category: keyof typeof PlugCategory;
  currentlyCanRoll: boolean;
  isEnhanced: boolean;

  constructor(
    rawPerkData: DestinyInventoryItemDefinition,
    category: keyof typeof PlugCategory,
    currentlyCanRoll: boolean
  ) {
    this.name = rawPerkData.displayProperties.name;
    this.description = rawPerkData.displayProperties.description;
    this.icon = BUNGIE_URL_ROOT + rawPerkData.displayProperties.icon;
    this.category = category;
    this.currentlyCanRoll = currentlyCanRoll;
    this.hash = rawPerkData.hash;
    this.isEnhanced = rawPerkData.inventory?.tierType == TierType.Common;
    if (this.isEnhanced) {
      const beforeLength = this.name.length;
      this.name = this.name.replace(" Enhanced", "");
      if (beforeLength !== this.name.length) {
        _logger.debug(`Removed 'Enhanced' from: ${this.name}`);
      }
    }
  }

  toString() {
    if (this.currentlyCanRoll) return this.name + (this.isEnhanced == true ? "*" : "");
    else return "~~" + this.name + "~~";
  }
}
