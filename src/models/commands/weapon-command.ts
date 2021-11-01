import Discord from "discord.js";
import {
  orderResultsByName,
  orderResultsByRandomOrTierType,
} from "../../utils/utils";
import { Weapon } from "../destiny-entities/weapon";
import BaseCommand from "./base-command";

export default class WeaponCommand implements BaseCommand<Weapon> {
  readonly input: string;
  readonly results: Weapon[];
  options: WeaponCommandOptions;
  constructor(
    input: string,
    options: WeaponCommandOptions,
    weaponResults: Weapon[]
  ) {
    this.input = input;
    this.options = options;

    const orderedResults = orderResultsByRandomOrTierType(weaponResults);
    this.results = orderResultsByName(this.input, orderedResults);
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
  constructor(full = false, isDefault = false, stats = false) {
    this.full = full;
    this.isDefault = isDefault;
    this.stats = stats;

    if (!this.validateState()) throw Error("Command options are invalid");
  }

  static parseDiscordInteractionOptions(
    options: Discord.CommandInteractionOptionResolver
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
