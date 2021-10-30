import BaseCommand from "./base-command";
import Discord from "discord.js";
import {
  WeaponTableHash,
  WeaponTables,
} from "../../services/weapon-db-service";
import { WeaponBaseArchetype } from "../destiny-entities/weapon";
import { stringIs } from "../../utils/validator";

// Following readonly arrays map to available options or choices for search command
export const WeaponTypes = ["Kinetic", "Energy", "Power"] as const;

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

export const WeaponRarity = [
  "Basic",
  "Common",
  "Rare",
  "Legendary",
  "Exotic",
] as const;

export const WeaponDamageType = [
  "Kinetic",
  "Arc",
  "Solar",
  "Void",
  "Stasis",
] as const;

const ArchetypeQueryCommand = ["type", "class", "rarity", "damage"] as const; // mapped to buildCommands in DeployCommandService

export default class SearchCommand implements BaseCommand {
  readonly name: string = "search";
  readonly description: string = "Search for weapons with specific perks";
  readonly archetypeToSearch: ArchetypeToSearch;
  input: string = "";
  perksToSearch: PerksToSearch;
  results: SearchResult = {};

  get traitState() {
    return (
      ((this.perksToSearch?.traits1 ? 1 : 0) << 0) |
      ((this.perksToSearch?.traits2 ? 1 : 0) << 1)
    );
  }

  constructor(options: Discord.CommandInteractionOptionResolver) {
    let perksToSearchRaw: PerksToSearch = {};
    for (let name of WeaponTables) {
      perksToSearchRaw[name] = options.getString(name) ?? undefined;
    }

    let archetypeToSearch: ArchetypeToSearch = {};
    for (let name of ArchetypeQueryCommand) {
      let value = options.getString(name) ?? "";
      switch (name) {
        case "type":
          if (stringIs<typeof WeaponTypes[number]>(value, WeaponTypes))
            archetypeToSearch.type = value;
          break;
        case "class":
          if (stringIs<typeof WeaponClasses[number]>(value, WeaponClasses))
            archetypeToSearch.class = value;
          break;
        case "damage":
          if (
            stringIs<typeof WeaponDamageType[number]>(value, WeaponDamageType)
          )
            archetypeToSearch.damage = value;
          break;
        case "rarity":
          if (stringIs<typeof WeaponRarity[number]>(value, WeaponRarity))
            archetypeToSearch.rarity = value;
          break;
        default:
          // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
          // Prevent not accounting for new query types that was added to ArchetypeQueryCommand
          const _: never = name;
          throw Error("Unknown query type");
      }
    }

    this.archetypeToSearch = archetypeToSearch;
    this.perksToSearch = perksToSearchRaw;
    if (!this.validateState()) throw Error("Invalid traits combination");
  }

  setInput(input: string) {
    this.input = input;
  }

  validateAndAddResult(resultArchetype: WeaponBaseArchetype) {
    // validate archetype properties match between query and result
    for (let name of ArchetypeQueryCommand) {
      if (this.archetypeToSearch[name])
        if (resultArchetype.weaponBase != this.archetypeToSearch[name]) return;
    }

    if (this.results[resultArchetype.weaponClass])
      this.results[resultArchetype.weaponClass].push(resultArchetype);
    else this.results[resultArchetype.weaponClass] = [resultArchetype];
  }

  getCount() {
    let count = 0;
    for (let weaponClass in this.results) {
      count += this.results[weaponClass].length;
    }
    return count;
  }

  validateState() {
    return ValidTraitsOptions[this.traitState] ? true : false;
  }
}

export type PerksToSearch = Partial<
  Record<keyof typeof WeaponTableHash, string>
>;

export type ArchetypeToSearch = {
  type?: typeof WeaponTypes[number];
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
