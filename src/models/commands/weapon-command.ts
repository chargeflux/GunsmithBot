import Discord from "discord.js";
import {
  orderResultsByName,
  orderResultsByRandomOrTierType,
} from "../../utils/utils";
import { Weapon } from "../destiny-entities/weapon";
import BaseCommand from "./base-command";

export default class WeaponCommand implements BaseCommand<Weapon> {
  input: string;
  private _results?: Weapon[];
  options: WeaponCommandOptions;
  set results(results: Weapon[]) {
    const orderedResults = orderResultsByRandomOrTierType(results);

    this._results = orderResultsByName(this.input, orderedResults);
  }

  get results() {
    if (this._results) return this._results;
    throw Error("Failed to set weapon results");
  }

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

  setWeaponResults(results: Weapon[]) {
    this.results = results;
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
