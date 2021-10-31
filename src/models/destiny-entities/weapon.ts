import {
  DestinyInventoryItemDefinition,
  DestinyInventoryItemStatDefinition,
  DestinyItemSocketBlockDefinition,
  DestinyItemStatBlockDefinition,
} from "bungie-api-ts/destiny2";
import { BaseMetadata } from "../commands/base-metadata";
import { WeaponCommandOptions } from "../commands/weapon-command";
import {
  BUNGIE_URL_ROOT,
  DamageType,
  MAX_POWER_LEVEL,
  StatOrder,
  WeaponBase,
  WeaponStat,
  WeaponTierType,
} from "../constants";
import Perk from "./perk";
import Socket from "./socket";
import { logger } from "../../services/logger-service";

const _logger = logger.getChildLogger({ name: "Weapon" });

export class Weapon implements BaseMetadata {
  name: string;
  flavorText: string;
  icon: string;
  screenshot: string;
  hasRandomRolls: boolean;
  hash: number;
  stats: WeaponStatBlock[] = [];
  rawData: WeaponRawData;
  powerCapValues?: number[];
  baseArchetype?: WeaponBaseArchetype;
  sockets: Socket[] = [];
  options: WeaponCommandOptions;

  constructor(
    rawWeaponData: DestinyInventoryItemDefinition,
    options: WeaponCommandOptions = new WeaponCommandOptions()
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
        this.stats = this.processStats(rawWeaponData.stats);
      else throw Error("Stats for weapon are missing: " + this.name);
    }

    const powerCapHashes =
      rawWeaponData.quality?.versions.map((x) => x.powerCapHash) ?? [];
    const itemCategoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    const weaponTierTypeHash = rawWeaponData.inventory?.tierTypeHash;
    const weaponDamageTypeId = rawWeaponData.defaultDamageType;
    const sockets = rawWeaponData.sockets;

    this.rawData = new WeaponRawData(
      this.name,
      powerCapHashes,
      itemCategoryHashes,
      weaponDamageTypeId,
      weaponTierTypeHash,
      sockets
    );
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

  processStats(statsData: DestinyItemStatBlockDefinition): WeaponStatBlock[] {
    const weaponStats: WeaponStatBlock[] = [];
    let idx = 0;
    for (const statHash in statsData.stats) {
      const stat: DestinyInventoryItemStatDefinition =
        statsData.stats[statHash];
      const statType = WeaponStat[statHash] as
        | keyof typeof WeaponStat
        | undefined;
      if (!statType) {
        _logger.debug("Failed to match weapon stat hash:", statHash);
        continue;
      }
      const statValue = stat.value;
      if (statValue == 0) {
        _logger.debug(statType, "had a value of 0");
        continue;
      }
      const weaponStatBlock = new WeaponStatBlock(
        idx,
        new WeaponStatData(statType, statValue)
      );
      weaponStats.push(weaponStatBlock);
      idx += 1;
    }
    weaponStats.sort((a, b) =>
      StatOrder[a.stat.statType] > StatOrder[b.stat.statType]
        ? 1
        : StatOrder[a.stat.statType] < StatOrder[b.stat.statType]
        ? -1
        : 0
    );
    return weaponStats;
  }
}

export class MinimalWeapon {
  name: string;
  hasRandomRolls: boolean;
  hash: number;
  rawData: WeaponRawData;
  powerCapValues?: number[];
  baseArchetype?: WeaponBaseArchetype;

  constructor(rawWeaponData: DestinyInventoryItemDefinition) {
    this.name = rawWeaponData.displayProperties.name;
    this.hasRandomRolls = rawWeaponData.displaySource != "";
    this.hash = rawWeaponData.hash;
    const powerCapHashes =
      rawWeaponData.quality?.versions.map((x) => x.powerCapHash) ?? [];
    const itemCategoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    const weaponTierTypeHash = rawWeaponData.inventory?.tierTypeHash;
    const weaponDamageTypeId = rawWeaponData.defaultDamageType;
    const sockets = rawWeaponData.sockets;

    this.rawData = new WeaponRawData(
      this.name,
      powerCapHashes,
      itemCategoryHashes,
      weaponDamageTypeId,
      weaponTierTypeHash,
      sockets
    );
  }

  setPowerCapValues(powerCapValues: number[]) {
    this.powerCapValues = powerCapValues;
  }

  setBaseArchetype(baseArchetype: WeaponBaseArchetype) {
    this.baseArchetype = baseArchetype;
  }
}

export class WeaponRawData {
  name: string;
  powerCapHashes: number[];
  itemCategoryHashes: number[];
  weaponDamageTypeId: number;
  weaponTierTypeHash?: number;
  socketData?: DestinyItemSocketBlockDefinition;

  constructor(
    name: string,
    powerCapHashes: number[],
    itemCategoryHashes: number[],
    weaponDamageTypeId: number,
    weaponTierTypeHash?: number,
    socketData?: DestinyItemSocketBlockDefinition
  ) {
    this.name = name;
    this.powerCapHashes = powerCapHashes;
    this.itemCategoryHashes = itemCategoryHashes;
    this.weaponDamageTypeId = weaponDamageTypeId;
    this.weaponTierTypeHash = weaponTierTypeHash;
    this.socketData = socketData;
  }
}

export class WeaponBaseArchetype {
  readonly name: string;
  readonly weaponBase: keyof typeof WeaponBase;
  readonly weaponClass: keyof typeof WeaponBase;
  readonly weaponTierType: keyof typeof WeaponTierType;
  readonly weaponDamageType: keyof typeof DamageType;
  readonly intrinsic?: Perk;
  readonly isKinetic: boolean;
  private _powerCap?: number;

  public set powerCap(value: number) {
    if (value != MAX_POWER_LEVEL) this._powerCap = value;
  }

  public get powerCap(): number {
    return this._powerCap ?? 0;
  }

  constructor(
    name: string,
    weaponBase: keyof typeof WeaponBase,
    weaponClass: keyof typeof WeaponBase,
    weaponTierType: keyof typeof WeaponTierType,
    weaponDamageType: keyof typeof DamageType,
    isKinetic: boolean,
    intrinsic?: Perk
  ) {
    this.name = name;
    this.weaponBase = weaponBase;
    this.weaponClass = weaponClass;
    this.weaponTierType = weaponTierType;
    this.weaponDamageType = weaponDamageType;
    this.isKinetic = isKinetic;
    this.intrinsic = intrinsic;
  }

  toString() {
    let stringToConstruct = "";
    if (!this.isKinetic) stringToConstruct += this.weaponDamageType + " ";
    stringToConstruct += this.weaponBase;
    stringToConstruct += " " + this.weaponClass;
    if (this.powerCap)
      stringToConstruct += " (" + this.powerCap.toString() + ")";

    if (stringToConstruct) {
      return "**" + stringToConstruct.trim() + "**";
    }
  }
}

export class WeaponStatBlock {
  readonly idx: number;
  readonly stat: WeaponStatData;

  constructor(idx: number, stat: WeaponStatData) {
    this.idx = idx;
    this.stat = stat;
  }

  toString() {
    return this.stat;
  }
}

class WeaponStatData {
  readonly statType: keyof typeof WeaponStat;
  readonly value: number;

  constructor(statType: keyof typeof WeaponStat, value: number) {
    this.statType = statType;
    this.value = value;
  }

  toString() {
    return "**" + this.statType + "**: " + this.value;
  }
}
