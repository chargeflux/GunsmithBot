import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Discord from "discord.js";
import { validateWeaponSearch } from "../../utils/utils";
import { Weapon } from "../destiny-entities/weapon";
import BaseCommand from "./base-command";

export default class WeaponCommand implements BaseCommand {
  name = "weapon";
  description = "Get information about a weapon";
  input: string;
  weaponResults: Weapon[] = [];
  options: WeaponCommandOptions;

  constructor(
    input: string,
    options: Discord.CommandInteractionOptionResolver
  ) {
    this.input = input;
    this.options = new WeaponCommandOptions(
      options.getBoolean("full") ?? false,
      options.getBoolean("default") ?? false,
      options.getBoolean("stats") ?? false
    );
  }

  processWeaponResults(results: DestinyInventoryItemDefinition[]) {
    for (const result of results) {
      if (validateWeaponSearch(result)) {
        const weapon = new Weapon(result, this.options);
        this.weaponResults.push(weapon);
      }
    }
  }

  setWeaponResults(results: Weapon[]) {
    this.weaponResults = results;
  }
}

export class WeaponCommandOptions {
  full: boolean;
  isDefault: boolean;
  stats: boolean;

  get state() {
    return (
      ((this.stats ? 1 : 0) << 2) |
      ((this.isDefault ? 1 : 0) << 1) |
      ((this.full ? 1 : 0) << 0)
    );
  }
  constructor(
    full = false,
    isDefault = false,
    stats = false
  ) {
    this.full = full;
    this.isDefault = isDefault;
    this.stats = stats;

    if (!this.validateState()) throw Error("Command options are invalid");
  }

  validateState() {
    return ValidCommandOptionStates[this.state] ? true : false;
  }
}

enum ValidCommandOptionStates {
  NONE = 0,
  FULL = 1 << 0,
  DEFAULT = 1 << 1,
  STATS = 1 << 2,
}
