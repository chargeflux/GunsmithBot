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
    const results = this.orderByRandomRollAndTierType(weaponResults);
    this.results = orderResultsByName(this.input, results);
    this.count = this.results.length;
  }

  orderByRandomRollAndTierType(weaponResults: Weapon[]) {
    return weaponResults.sort((a, b) => {
      if (!a.hasRandomRolls && a.archetype.rarity != "Exotic") {
        return 1;
      }
      if (!b.hasRandomRolls && b.archetype.rarity != "Exotic") {
        return -1;
      }
      if (a.archetype.powerCap == b.archetype.powerCap) {
        return b.seasonNumber - a.seasonNumber;
      }
      return b.archetype.powerCap - a.archetype.powerCap;
    });
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
