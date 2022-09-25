import BaseCommand from "./baseCommand";
import { CacheType, CommandInteractionOptionResolver } from "discord.js";
import { WeaponTableHash, WeaponTables } from "../../services/weaponDbService";
import { WeaponBaseArchetype } from "../destiny-entities/weaponBaseArchetype";
import { stringIs } from "../../utils/validator";
import PublicError from "../errors/publicError";

// Following readonly arrays map to available options or choices for search command
export const WeaponSlots = ["Kinetic", "Energy", "Power"] as const;

export const WeaponClasses = [
  "Auto Rifle",
  "Hand Cannon",
  "Pulse Rifle",
  "Scout Rifle",
  "Fusion Rifle",
  "Sniper Rifle",
  "Shotgun",
  "Machine Gun",
  "Rocket Launcher",
  "Sidearm",
  "Sword",
  "Grenade Launcher",
  "Linear Fusion Rifle",
  "Trace Rifle",
  "Bow",
  "Submachine Gun",
] as const;

export const WeaponRarity = ["Basic", "Common", "Rare", "Legendary", "Exotic"] as const;

export const WeaponDamageType = ["Kinetic", "Arc", "Solar", "Void", "Stasis"] as const;

export const ArchetypeQueryCommand = ["slot", "class", "rarity", "damage"] as const; // mapped to buildCommands in DeployCommandService

export default class SearchCommand implements BaseCommand<WeaponBaseArchetype> {
  readonly archetypeToSearch: ArchetypeToSearch;
  input = "";
  perksToSearch: PerksToSearch;
  results: SearchResult = {};
  statement = "";
  queries: string[] = [];

  get count() {
    return this.getCount();
  }

  get traitState() {
    return (
      ((this.perksToSearch.get("traits1") ? 1 : 0) << 0) |
      ((this.perksToSearch.get("traits2") ? 1 : 0) << 1)
    );
  }

  constructor(
    options: Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">
  ) {
    const perksToSearchRaw: PerksToSearch = new Map();
    for (const name of WeaponTables) {
      const value = options.getString(name);
      if (value) {
        perksToSearchRaw.set(name, value);
      }
    }

    const archetypeToSearch: ArchetypeToSearch = {};
    for (const name of ArchetypeQueryCommand) {
      const value = options.getString(name) ?? "";
      switch (name) {
        case "slot":
          if (stringIs<typeof WeaponSlots[number]>(value, WeaponSlots))
            archetypeToSearch.slot = value;
          break;
        case "class":
          if (stringIs<typeof WeaponClasses[number]>(value, WeaponClasses))
            archetypeToSearch.class = value;
          break;
        case "damage":
          if (stringIs<typeof WeaponDamageType[number]>(value, WeaponDamageType))
            archetypeToSearch.damage = value;
          break;
        case "rarity":
          if (stringIs<typeof WeaponRarity[number]>(value, WeaponRarity))
            archetypeToSearch.rarity = value;
          break;
        default: {
          // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
          // Prevent not accounting for new query types that was added to ArchetypeQueryCommand
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _: never = name;
          throw Error("Unknown query type");
        }
      }
    }

    this.archetypeToSearch = archetypeToSearch;
    this.perksToSearch = perksToSearchRaw;
    if (!this.validateState())
      throw new PublicError(
        "Please check your traits syntax: Valid combinations are 'traits1: value' or 'traits1: value traits2: value'"
      );
  }

  setStatement(input: string) {
    input = input.replace(/^.*?(?=SELECT)/, "");
    if (!input.includes("(")) {
      input = input.replace(");", ";");
    }
    this.statement = input;
  }

  setInput(inputParts: string[]) {
    const archetypeParts: string[] = [];
    for (const name of ArchetypeQueryCommand) {
      if (this.archetypeToSearch[name])
        archetypeParts.push(name + ": " + this.archetypeToSearch[name]);
    }
    this.input = archetypeParts.concat(inputParts).join(", ");
  }

  validateAndAddResult(resultArchetype: WeaponBaseArchetype) {
    // validate archetype properties match between query and result
    for (const name of ArchetypeQueryCommand) {
      if (this.archetypeToSearch[name])
        if (resultArchetype[name] != this.archetypeToSearch[name]) return;
    }

    if (this.results[resultArchetype.class])
      this.results[resultArchetype.class].push(resultArchetype);
    else this.results[resultArchetype.class] = [resultArchetype];
  }

  getCount() {
    let count = 0;
    for (const weaponClass in this.results) {
      count += this.results[weaponClass].length;
    }
    return count;
  }

  validateState() {
    return ValidTraitsOptions[this.traitState] ? true : false;
  }
}

export type PerksToSearch = Map<keyof typeof WeaponTableHash, string>;

export type ArchetypeToSearch = {
  slot?: typeof WeaponSlots[number];
  class?: typeof WeaponClasses[number];
  damage?: typeof WeaponDamageType[number];
  rarity?: typeof WeaponRarity[number];
};

export type SearchResult = {
  [category: string]: WeaponBaseArchetype[];
};

export enum ValidTraitsOptions {
  None = 0,
  Traits1 = 1 << 0,
  Traits1AndTraits2 = Traits1 | (1 << 1),
}
