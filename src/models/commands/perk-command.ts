import BaseCommand from "./base-command";
import { PlugCategory } from "../constants";
import Perk from "../destiny-entities/perk";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

export default class PerkCommand implements BaseCommand {
  readonly name: string = "perk";
  readonly description: string = "Get information about a perk";
  readonly input: string;
  perkResults: Perk[] = [];

  constructor(input: string) {
    this.input = input;
  }

  async processResults(results: DestinyInventoryItemDefinition[]) {
    for (const result of results) {
      if (result.plug?.plugCategoryHash) {
        const plugCategoryName = PlugCategory[result.plug?.plugCategoryHash] as
          | keyof typeof PlugCategory
          | undefined;
        if (!plugCategoryName) continue; // runtime check
        let perk = new Perk(result, plugCategoryName);
        this.perkResults.push(perk);
      }
    }
  }
}
