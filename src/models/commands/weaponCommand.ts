import { orderResultsByName } from "../../utils/utils";
import { Weapon } from "../destiny-entities/weapon";
import BaseCommand from "./baseCommand";
import WeaponOptions from "../command-options/weaponOptions";

export default class WeaponCommand implements BaseCommand<Weapon> {
  readonly input: string;
  readonly results: Weapon[];
  readonly count: number;
  options: WeaponOptions;
  constructor(input: string, options: WeaponOptions, weaponResults: Weapon[]) {
    this.input = input;
    this.options = options;
    const results = this.orderByRandomRollAndTierType(weaponResults);
    this.results = orderResultsByName(this.input, results);
    this.count = this.results.length;
  }

  orderByRandomRollAndTierType(weaponResults: Weapon[]) {
    return weaponResults.sort((a, b) => {
      if (a.name == b.name) {
        return b.seasonNumber - a.seasonNumber;
      }
      if (!a.hasRandomRolls && a.archetype.rarity != "Exotic") {
        return 1;
      }
      if (!b.hasRandomRolls && b.archetype.rarity != "Exotic") {
        return -1;
      }
      if (a.archetype.powerCap == b.archetype.powerCap) {
        return b.seasonNumber - a.seasonNumber;
      }
      const diff = a.archetype.powerCap - b.archetype.powerCap;
      if (a.archetype.powerCap != 0 && b.archetype.powerCap != 0) {
        return -diff;
      } else {
        return diff;
      }
    });
  }
}
