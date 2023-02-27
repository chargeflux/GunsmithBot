import { orderResultsByName } from "../../utils/utils";
import { Armor } from "../destiny-entities/armor";
import BaseCommand from "./baseCommand";

export default class ArmorCommand implements BaseCommand<Armor> {
  readonly input: string;
  readonly results: Armor[];
  readonly count: number;
  constructor(input: string, armorResults: Armor[]) {
    this.input = input;
    const orderedResultsName = orderResultsByName(this.input, armorResults);
    this.results = this.orderResultsByTierType(orderedResultsName);
    this.count = this.results.length;
  }

  orderResultsByTierType(armorResults: Armor[]): Armor[] {
    const armorPieces: Armor[] = [];
    for (const armor of armorResults) {
      if (armor.archetype) {
        if (armor.archetype.rarity == "Exotic") {
          armorPieces.splice(0, 0, armor);
        } else armorPieces.push(armor);
      }
    }
    return armorPieces;
  }
}
