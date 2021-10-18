import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { getInventoryItemByName } from "../../services/inventory-item-service";
import { toTitleCase } from "../../utils/utils";
import BaseCommand from "./base-command";
import { BaseMetadata } from "./base-metadata";
import { PlugCategoryHash, BUNGIE_URL_ROOT } from "./constants";

export default class PerkCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }

  readonly name: string = "perk";
  readonly description: string = "Get information about a perk";
  readonly input: string;
  perkInfoResults: PerkInfo[] = [];

  async process() {
    const results = await getInventoryItemByName(this.input);

    for (const result of results) {
      if (result.plug?.plugCategoryHash) {
        const plugCategoryName =
          PlugCategoryHash[result.plug?.plugCategoryHash];
        let perkInfo = new PerkInfo(result, plugCategoryName);
        this.perkInfoResults.push(perkInfo);
      }
    }
  }
}

export class PerkInfo implements BaseMetadata {
  name: string;
  description: string;
  icon: string;
  category: string;

  constructor(rawPerkData: DestinyInventoryItemDefinition, category: string) {
    this.name = rawPerkData.displayProperties.name;
    this.description = rawPerkData.displayProperties.description;
    this.icon = BUNGIE_URL_ROOT + rawPerkData.displayProperties.icon;
    this.category = toTitleCase(category);
  }
}
