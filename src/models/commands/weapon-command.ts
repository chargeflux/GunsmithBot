import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import BaseCommand from "./base-command";
import { WeaponBase } from "../constants";
import { Weapon } from "../destiny-entities/weapon";
import Discord from "discord.js";

export default class WeaponCommand implements BaseCommand {
  constructor(
    input: string,
    options: Discord.CommandInteractionOptionResolver
  ) {
    this.input = input;
    this.options = {
      full: options.getBoolean("full") ?? false,
      default: options.getBoolean("default") ?? false,
    };
    if ((this.options.full == this.options.default) == true)
      throw Error("Both 'full' and 'default' cannot be true");
  }
  name: string = "weapon";
  description: string = "Get information about a weapon";
  input: string;
  weaponResults: Weapon[] = [];
  options: WeaponCommandOptions;

  processWeaponResults(results: DestinyInventoryItemDefinition[]) {
    for (const result of results) {
      if (this.validateWeaponSearch(result)) {
        let weapon = new Weapon(result, this.options);
        this.weaponResults.push(weapon);
      }
    }
  }

  setWeaponResults(results: Weapon[]) {
    this.weaponResults = results;
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

export type WeaponCommandOptions = {
  full: boolean;
  default: boolean;
};
