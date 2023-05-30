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
    if (options.adept) {
      weaponResults = weaponResults.filter((x) => x.name.includes("(Adept)"));
    }
    const results = this.orderByWeaponHeuristics(weaponResults);
    this.results = orderResultsByName(this.input, results);
    this.count = this.results.length;
  }

  orderByWeaponHeuristics(weaponResults: Weapon[]) {
    return weaponResults.sort((a, b) => {
      let seasonalDiff = b.seasonNumber - a.seasonNumber;
      if (seasonalDiff == 0) {
        // Handle event weapons
        seasonalDiff = b.index - a.index;
      }
      if (a.name == b.name) {
        return seasonalDiff;
      }
      if (!a.hasRandomRolls && a.archetype.rarity != "Exotic") {
        return 1;
      }
      if (!b.hasRandomRolls && b.archetype.rarity != "Exotic") {
        return -1;
      }
      if (a.archetype.powerCap == b.archetype.powerCap) {
        return seasonalDiff;
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
