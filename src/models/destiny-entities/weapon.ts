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
    options: WeaponCommandOptions
  ) {
    this.name = rawWeaponData.displayProperties.name;
    this.flavorText = rawWeaponData.flavorText;
    this.screenshot = BUNGIE_URL_ROOT + rawWeaponData.screenshot;
    this.icon = BUNGIE_URL_ROOT + rawWeaponData.displayProperties.icon;
    this.hasRandomRolls = rawWeaponData.displaySource != "";
    this.hash = rawWeaponData.hash;
    this.options = options;
    if (!this.options.default) {
      if (rawWeaponData.stats)
        this.stats = this.processStats(rawWeaponData.stats);
      else throw Error("Stats for weapon are missing: " + this.name);
    }

    let powerCapHashes =
      rawWeaponData.quality?.versions.map((x) => x.powerCapHash) ?? [];
    let itemCategoryHashes = rawWeaponData.itemCategoryHashes ?? [];
    let weaponTierTypeHash = rawWeaponData.inventory?.tierTypeHash;
    let weaponDamageTypeId = rawWeaponData.defaultDamageType;
    let sockets = rawWeaponData.sockets;

    this.rawData = new WeaponRawData(
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
    let weaponStats: WeaponStatBlock[] = [];
    let idx = 0;
    for (let statHash in statsData.stats) {
      let stat: DestinyInventoryItemStatDefinition = statsData.stats[statHash];
      let statType = WeaponStat[statHash] as
        | keyof typeof WeaponStat
        | undefined;
      if (!statType) {
        console.debug("Failed to match weapon stat hash:", statHash);
        continue;
      }
      let statValue = stat.value;
      if (statValue == 0) {
        console.debug(statType, "had a value of 0");
        continue;
      }
      let weaponStatBlock = new WeaponStatBlock(
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

export class WeaponRawData {
  powerCapHashes: number[];
  itemCategoryHashes: number[];
  weaponDamageTypeId: number;
  weaponTierTypeHash?: number;
  socketData?: DestinyItemSocketBlockDefinition;

  constructor(
    powerCapHashes: number[],
    itemCategoryHashes: number[],
    weaponDamageTypeId: number,
    weaponTierTypeHash?: number,
    socketData?: DestinyItemSocketBlockDefinition
  ) {
    this.powerCapHashes = powerCapHashes;
    this.itemCategoryHashes = itemCategoryHashes;
    this.weaponDamageTypeId = weaponDamageTypeId;
    this.weaponTierTypeHash = weaponTierTypeHash;
    this.socketData = socketData;
  }
}

export class WeaponBaseArchetype {
  readonly weaponBase: keyof typeof WeaponBase;
  readonly weaponClass: keyof typeof WeaponBase;
  readonly weaponTierType: keyof typeof WeaponTierType;
  readonly weaponDamageType: keyof typeof DamageType;
  readonly intrinsic: Perk;
  readonly isEnergy: boolean;
  private _powerCap?: number;

  public set powerCap(value: number) {
    if (value != MAX_POWER_LEVEL) this._powerCap = value;
  }

  public get powerCap(): number {
    return this._powerCap ?? 0;
  }

  constructor(
    weaponBase: keyof typeof WeaponBase,
    weaponClass: keyof typeof WeaponBase,
    weaponTierType: keyof typeof WeaponTierType,
    weaponDamageType: keyof typeof DamageType,
    isEnergy: boolean,
    intrinsic: Perk
  ) {
    this.weaponBase = weaponBase;
    this.weaponClass = weaponClass;
    this.weaponTierType = weaponTierType;
    this.weaponDamageType = weaponDamageType;
    this.isEnergy = isEnergy;
    this.intrinsic = intrinsic;
  }

  toString() {
    let stringToConstruct = "";
    if (this.isEnergy) stringToConstruct += this.weaponDamageType + " ";
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
  readonly statType: keyof typeof WeaponStat; // enum WeaponStat
  readonly value: number;

  constructor(statType: keyof typeof WeaponStat, value: number) {
    this.statType = statType;
    this.value = value;
  }

  toString() {
    return "**" + this.statType + "**: " + this.value;
  }
}
