import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { ModCategory } from "../constants";
import Mod from "../destiny-entities/mod";
import BaseCommand from "./base-command";

export default class ModCommand implements BaseCommand {
  readonly name: string = "mod";
  readonly description: string = "Get information about a mod";
  readonly input: string;
  modResults: Mod[] = [];

  constructor(input: string) {
    this.input = input;
  }

  processResults(results: DestinyInventoryItemDefinition[]) {
    for (const result of results) {
      if (!result.itemCategoryHashes) continue;
      let modCategoryName: keyof typeof ModCategory;
      let armorLocation: keyof typeof ModCategory | undefined;
      if (!result.itemCategoryHashes.includes(ModCategory.Mods)) continue;
      else if (result.itemCategoryHashes.includes(ModCategory.Armor)) {
        modCategoryName = ModCategory[
          ModCategory.Armor
        ] as keyof typeof ModCategory;
        armorLocation = ModCategory[
          result.itemCategoryHashes.filter(
            (x) => x != ModCategory.Mods && x != ModCategory.Armor
          )[0] // assuming there is only 3 categories
        ] as keyof typeof ModCategory;
      } else if (result.itemCategoryHashes.includes(ModCategory.WeaponDamage)) {
        modCategoryName = ModCategory[
          ModCategory.WeaponDamage
        ] as keyof typeof ModCategory;
      } else if (result.traitHashes?.includes(ModCategory.Aspect)) {
        modCategoryName = ModCategory[
          ModCategory.Aspect
        ] as keyof typeof ModCategory;
      } else if (result.traitHashes?.includes(ModCategory.Fragment)) {
        modCategoryName = ModCategory[
          ModCategory.Fragment
        ] as keyof typeof ModCategory;
      } else if (result.itemCategoryHashes.includes(ModCategory["Bonus Mods"]))
        continue;
      else
        throw Error(
          "Could not identify mod category hashes: " + result.itemCategoryHashes
        );
      let mod = new Mod(result, modCategoryName, armorLocation);
      this.modResults.push(mod);
    }
  }
}
