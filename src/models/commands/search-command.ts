import BaseCommand from "./base-command";
import Discord from "discord.js";
import {
  WeaponTableHash,
  WeaponTables,
} from "../../services/weapon-db-service";
import { WeaponBaseArchetype } from "../destiny-entities/weapon";

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
      perksToSearchRaw[name as keyof typeof WeaponTableHash] =
        options.getString(name) ?? undefined;
    }

    let archetypeQuery: ArchetypeToSearch = {
      type: options.getString("type") ?? undefined,
      weaponClass: options.getString("class") ?? undefined,
      rarity: options.getString("rarity") ?? undefined,
      energyType: options.getString("energy") ?? undefined,
    };
    this.archetypeToSearch = archetypeQuery;
    this.perksToSearch = perksToSearchRaw;
    if (!this.validateState()) throw Error("Invalid traits combination");
  }

  setInput(input: string) {
    this.input = input;
  }

  addResult(baseArchetype: WeaponBaseArchetype) {
    if (this.archetypeToSearch.type)
      if (baseArchetype.weaponBase != this.archetypeToSearch.type) return;
    if (this.archetypeToSearch.weaponClass)
      if (baseArchetype.weaponClass != this.archetypeToSearch.weaponClass)
        return;
    if (this.archetypeToSearch.rarity)
      if (baseArchetype.weaponTierType != this.archetypeToSearch.rarity) return;
    if (this.archetypeToSearch.energyType)
      if (baseArchetype.weaponDamageType != this.archetypeToSearch.energyType)
        return;
    if (this.results[baseArchetype.weaponClass])
      this.results[baseArchetype.weaponClass].push(baseArchetype);
    else this.results[baseArchetype.weaponClass] = [baseArchetype];
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
  type?: string;
  weaponClass?: string;
  rarity?: string;
  energyType?: string;
};

export type SearchResult = {
  [category: string]: WeaponBaseArchetype[];
};

export enum ValidTraitsOptions {
  None = 0,
  Traits1 = 1 << 0,
  Traits1AndTraits2 = Traits1 | (1 << 1),
}
