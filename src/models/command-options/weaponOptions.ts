import { CommandInteractionOptionResolver, CacheType } from "discord.js";
import ValidationError from "../errors/validationError";
import BaseOptions from "./baseOptions";

export default class WeaponOptions implements BaseOptions {
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
  ): WeaponOptions {
    const full = options.getBoolean("full") ?? false;
    const isDefault = options.getBoolean("default") ?? false;
    const stats = options.getBoolean("stats") ?? false;

    return new WeaponOptions(full, isDefault, stats);
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
