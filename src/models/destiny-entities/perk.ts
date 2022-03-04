import { DestinyInventoryItemDefinition, TierType } from "bungie-api-ts/destiny2";
import { logger } from "../../services/logger-service";
import { BaseMetadata } from "../commands/base-metadata";
import { BUNGIE_URL_ROOT, PlugCategory } from "../constants";

const _logger = logger.getChildLogger({ name: "Perk" });

export default class Perk implements BaseMetadata {
  name: string;
  description: string;
  icon: string;
  hash: number;
  category: keyof typeof PlugCategory;
  currentlyCanRoll: boolean;
  enhanced: boolean;

  constructor(
    rawPerkData: DestinyInventoryItemDefinition,
    category: keyof typeof PlugCategory,
    currentlyCanRoll: boolean,
  ) {
    this.name = rawPerkData.displayProperties.name;
    this.description = rawPerkData.displayProperties.description;
    this.icon = BUNGIE_URL_ROOT + rawPerkData.displayProperties.icon;
    this.category = category;
    this.currentlyCanRoll = currentlyCanRoll;
    this.hash = rawPerkData.hash;
    this.enhanced = rawPerkData.inventory?.tierType == TierType.Common;
    if (this.enhanced) {
      const beforeLength = this.name.length;
      this.name = this.name.replace(" Enhanced", "")
      if (beforeLength !== this.name.length) {
        _logger.debug(`Removed 'Enhanced' from: ${this.name}`)
      }
    }
      
  }

  toString() {
    if (this.currentlyCanRoll) return this.name + (this.enhanced == true ? "*" : "");
    else return "~~" + this.name + "~~";
  }
}
