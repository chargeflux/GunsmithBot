import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import BaseCommand from "./base-command";
import { WeaponBase } from "../constants";
import { Weapon } from "../destiny-entities/weapon";

export default class WeaponCommand implements BaseCommand {
  constructor(input: string) {
    this.input = input;
  }
  name: string = "weapon";
  description: string = "Get information about a weapon";
  input: string;
  weaponResults: Weapon[] = [];

  setWeaponResults(results: DestinyInventoryItemDefinition[]) {
    for (const result of results) {
      if (this.validateWeaponSearch(result)) {
        let weapon = new Weapon(result);
        this.weaponResults.push(weapon);
      }
    }
  }

  private validateWeaponSearch(
    rawWeaponData: DestinyInventoryItemDefinition
  ): boolean {
    let categoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    if (!categoryHashes.includes(WeaponBase.Weapon)) return false;
    if (categoryHashes.includes(WeaponBase.Dummy)) return false;
    if (!rawWeaponData.sockets) return false;
    return true;
  }
}
