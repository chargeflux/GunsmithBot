import { ArmorType, GuardianClass, MAX_POWER_LEVEL, TierType } from "../constants";
import { BaseDestinyItem } from "./baseMetadata";
import Perk from "./perk";

export class ArmorBaseArchetype implements BaseDestinyItem {
  readonly name: string;
  readonly guardianClass: keyof typeof GuardianClass;
  readonly type: keyof typeof ArmorType;
  readonly rarity: keyof typeof TierType;
  readonly intrinsic?: Perk;
  private _powerCap?: number;

  public set powerCap(value: number) {
    if (value != MAX_POWER_LEVEL) this._powerCap = value;
  }

  public get powerCap(): number {
    return this._powerCap ?? 0;
  }

  private constructor(
    name: string,
    guardianClass: keyof typeof GuardianClass,
    armorType: keyof typeof ArmorType,
    armorTierType: keyof typeof TierType,
    intrinsic?: Perk
  ) {
    this.name = name;
    this.guardianClass = guardianClass;
    this.type = armorType;
    this.rarity = armorTierType;
    this.intrinsic = intrinsic;
  }

  static create(data: ArmorArchetypeData, intrinsic?: Perk): ArmorBaseArchetype {
    let guardianClass: keyof typeof GuardianClass | undefined;
    let armorType: keyof typeof ArmorType | undefined;
    let armorTierType: keyof typeof TierType | undefined;
    for (const hash of data.itemCategoryHashes.sort().slice(1)) {
      const category = GuardianClass[hash] as keyof typeof GuardianClass | undefined;
      if (category) {
        guardianClass = category;
      } else {
        const category = ArmorType[hash] as keyof typeof ArmorType | undefined;
        if (category) {
          armorType = category;
        }
      }
    }
    if (!guardianClass) throw Error("Failed to parse guardian class");
    if (!armorType) throw Error("Failed to parse armor type");

    const tierTypeHash = data.armorTierTypeHash;
    if (tierTypeHash) armorTierType = TierType[tierTypeHash] as keyof typeof TierType | undefined;
    else throw Error("Tier type hash is invalid");
    if (!armorTierType) throw Error(`Failed to parse tier type hash ${tierTypeHash}`);

    const baseArchetype = new ArmorBaseArchetype(
      data.name,
      guardianClass,
      armorType,
      armorTierType,
      intrinsic
    );

    if (data.powerCapValues) baseArchetype.powerCap = Math.max(...data.powerCapValues);
    else throw Error("Failed to set power cap values");

    return baseArchetype;
  }

  toString() {
    let stringToConstruct = "";
    stringToConstruct += `${this.rarity} ${this.guardianClass} ${this.type}`;
    if (this.powerCap) stringToConstruct += " (" + this.powerCap.toString() + ")";
    if (stringToConstruct) {
      return "**" + stringToConstruct.trim() + "**";
    }
  }
}

export class ArmorArchetypeData {
  name: string;
  powerCapValues: number[];
  itemCategoryHashes: number[];
  armorTierTypeHash?: number;

  constructor(
    name: string,
    powerCapValues: number[],
    itemCategoryHashes: number[],
    armorTierTypeHash?: number
  ) {
    this.name = name;
    this.powerCapValues = powerCapValues;
    this.itemCategoryHashes = itemCategoryHashes;
    this.armorTierTypeHash = armorTierTypeHash;
  }
}
