import { orderResultsByName } from "../../utils/utils";
import { Armor } from "../destiny-entities/armor";
import BaseCommand from "./base-command";

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
    const names: string[] = armorResults.map((x) => x.name);
    for (const armor of armorResults) {
      if (armor.baseArchetype) {
        if (armor.baseArchetype.rarity == "Exotic") {
          const idx: number = names.indexOf(armor.name);
          if (idx > -1) armorPieces.splice(idx, 0, armor);
        } else armorPieces.push(armor);
      }
    }
    return armorPieces;
  }
}
