import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import { orderResultsByName } from "../../utils/utils";
import { Weapon } from "../destiny-entities/weapon";
import ValidationError from "../errors/validationError";
import BaseCommand from "./baseCommand";

export default class WeaponCommand implements BaseCommand<Weapon> {
  readonly input: string;
  readonly results: Weapon[];
  readonly count: number;
  options: WeaponCommandOptions;
  constructor(input: string, options: WeaponCommandOptions, weaponResults: Weapon[]) {
    this.input = input;
    this.options = options;
    const orderedResultsName = orderResultsByName(this.input, weaponResults);
    this.results = this.orderByRandomRollAndTierType(orderedResultsName);
    this.count = this.results.length;
  }

  orderByRandomRollAndTierType(weaponResults: Weapon[]) {
    const weapons: Weapon[] = [];
    const names: string[] = weaponResults.map((x) => x.name);
    for (const weapon of weaponResults) {
      if (weapon.archetype) {
        if (weapon.hasRandomRolls || weapon.archetype.rarity == "Exotic") {
          const idx: number = names.indexOf(weapon.name);
          if (idx > -1) weapons.splice(idx, 0, weapon);
        } else weapons.push(weapon);
      }
    }
    return weapons;
  }
}

export class WeaponCommandOptions {
  full: boolean;
  isDefault: boolean;
  stats: boolean;

  get state() {
    return (
      ((this.stats ? 1 : 0) << 2) | ((this.isDefault ? 1 : 0) << 1) | ((this.full ? 1 : 0) << 0)
    );
  }
  constructor(full = false, isDefault = false, stats = false) {
    this.full = full;
    this.isDefault = isDefault;
    this.stats = stats;

    if (!this.validateState()) throw new ValidationError("Command options are invalid");
  }

  static parseDiscordInteractionOptions(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
  ): WeaponCommandOptions {
    const full = options.getBoolean("full") ?? false;
    const isDefault = options.getBoolean("default") ?? false;
    const stats = options.getBoolean("stats") ?? false;

    return new WeaponCommandOptions(full, isDefault, stats);
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
