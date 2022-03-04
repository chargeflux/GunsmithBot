import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { BaseMetadata } from "../commands/base-metadata";
import { WeaponCommandOptions } from "../commands/weapon-command";
import { BUNGIE_URL_ROOT } from "../constants";
import Perk from "./perk";
import Socket from "./socket";
import {
  WeaponArchetypeData,
  WeaponBaseArchetype,
} from "./weapon-base-archetype";
import WeaponStats from "./weapon-stats";

export class Weapon implements BaseMetadata {
  name: string;
  flavorText: string;
  icon: string;
  screenshot: string;
  hasRandomRolls: boolean;
  hash: number;
  stats?: WeaponStats;
  powerCapValues?: number[];
  baseArchetype?: WeaponBaseArchetype;
  sockets: Socket[] = [];
  options: WeaponCommandOptions;

  constructor(
    rawWeaponData: DestinyInventoryItemDefinition,
    options: WeaponCommandOptions,
    powerCapValues: number[],
    sockets: Socket[],
    intrinsic?: Perk
  ) {
    this.name = rawWeaponData.displayProperties.name;
    this.flavorText = rawWeaponData.flavorText;
    this.screenshot = BUNGIE_URL_ROOT + rawWeaponData.screenshot;
    this.icon = BUNGIE_URL_ROOT + rawWeaponData.displayProperties.icon;
    this.hasRandomRolls = rawWeaponData.displaySource != "";
    this.hash = rawWeaponData.hash;
    this.options = options;
    if (!this.options.isDefault) {
      if (rawWeaponData.stats)
        this.stats = new WeaponStats(this.name, rawWeaponData.stats);
      else throw Error("Stats for weapon are missing: " + this.name);
    }

    const itemCategoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    const weaponTierTypeHash = rawWeaponData.inventory?.tierTypeHash;
    const weaponDamageTypeId = rawWeaponData.defaultDamageType;

    const archetypeData = new WeaponArchetypeData(
      this.name,
      powerCapValues,
      itemCategoryHashes,
      weaponDamageTypeId,
      rawWeaponData.itemTypeDisplayName, // FIXME: needed for Glaive
      weaponTierTypeHash
    );

    this.setBaseArchetype(WeaponBaseArchetype.create(archetypeData, intrinsic));

    this.setSockets(sockets);
  }

  setPowerCapValues(powerCapValues: number[]) {
    this.powerCapValues = powerCapValues;
  }

  setBaseArchetype(baseArchetype: WeaponBaseArchetype) {
    this.baseArchetype = baseArchetype;
  }

  setSockets(sockets: Socket[]) {
    this.sockets = sockets;
  }
}
