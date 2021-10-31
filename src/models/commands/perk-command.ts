import BaseCommand from "./base-command";
import { PlugCategory } from "../constants";
import Perk from "../destiny-entities/perk";
import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";

export default class PerkCommand implements BaseCommand<Perk> {
  readonly input: string;
  results: Perk[] = [];

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
        const perk = new Perk(result, plugCategoryName);
        this.results.push(perk);
      }
    }
  }
}
