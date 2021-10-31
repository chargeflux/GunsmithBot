import {
  DamageType,
  MAX_POWER_LEVEL,
  WeaponBase,
  WeaponTierType,
} from "../constants";
import Perk from "./perk";

export class WeaponBaseArchetype {
  readonly name: string;
  readonly type: keyof typeof WeaponBase;
  readonly class: keyof typeof WeaponBase;
  readonly rarity: keyof typeof WeaponTierType;
  readonly damage: keyof typeof DamageType;
  readonly intrinsic?: Perk;
  readonly isKinetic: boolean;
  private _powerCap?: number;

  public set powerCap(value: number) {
    if (value != MAX_POWER_LEVEL) this._powerCap = value;
  }

  public get powerCap(): number {
    return this._powerCap ?? 0;
  }

  private constructor(
    name: string,
    weaponBase: keyof typeof WeaponBase,
    weaponClass: keyof typeof WeaponBase,
    weaponTierType: keyof typeof WeaponTierType,
    weaponDamageType: keyof typeof DamageType,
    isKinetic: boolean,
    intrinsic?: Perk
  ) {
    this.name = name;
    this.type = weaponBase;
    this.class = weaponClass;
    this.rarity = weaponTierType;
    this.damage = weaponDamageType;
    this.isKinetic = isKinetic;
    this.intrinsic = intrinsic;
  }

  static create(
    data: WeaponArchetypeData,
    intrinsic?: Perk
  ): WeaponBaseArchetype {
    let weaponBase: keyof typeof WeaponBase | undefined;
    let weaponClass: keyof typeof WeaponBase | undefined;
    let weaponTierType: keyof typeof WeaponTierType | undefined;
    let isKinetic = false;
    for (const hash of data.itemCategoryHashes.sort().slice(1)) {
      const category = WeaponBase[hash] as keyof typeof WeaponBase | undefined;
      if (category) {
        // runtime check
        if (hash < 5) {
          weaponBase = category;
          isKinetic = hash <= 2;
        } else weaponClass = category;
      }
    }
    if (!weaponBase) throw Error("Failed to parse weapon base class"); // also accounts for isEnergy
    if (!weaponClass) throw Error("Failed to parse weapon class");

    const tierTypeHash = data.weaponTierTypeHash;
    if (tierTypeHash)
      weaponTierType = WeaponTierType[tierTypeHash] as
        | keyof typeof WeaponTierType
        | undefined;
    else throw Error("Weapon tier type hash is invalid");
    if (!weaponTierType)
      throw Error(`Failed to parse tier type hash ${tierTypeHash}`);

    const weaponDamageTypeId = data.weaponDamageTypeId;
    const damageType = DamageType[weaponDamageTypeId] as
      | keyof typeof DamageType
      | undefined;
    if (!damageType)
      throw Error(`Failed to parse damage type hash ${weaponDamageTypeId}`);

    const baseArchetype = new WeaponBaseArchetype(
      data.name,
      weaponBase,
      weaponClass,
      weaponTierType,
      damageType,
      isKinetic,
      intrinsic
    );

    if (data.powerCapValues)
      baseArchetype.powerCap = Math.max(...data.powerCapValues);
    else throw Error("Failed to set power cap values");

    return baseArchetype;
  }

  toString() {
    let stringToConstruct = "";
    if (!this.isKinetic) stringToConstruct += this.damage + " ";
    stringToConstruct += this.type;
    stringToConstruct += " " + this.class;
    if (this.powerCap)
      stringToConstruct += " (" + this.powerCap.toString() + ")";

    if (stringToConstruct) {
      return "**" + stringToConstruct.trim() + "**";
    }
  }
}

export class WeaponArchetypeData {
  name: string;
  powerCapValues: number[];
  itemCategoryHashes: number[];
  weaponDamageTypeId: number;
  weaponTierTypeHash?: number;

  constructor(
    name: string,
    powerCapValues: number[],
    itemCategoryHashes: number[],
    weaponDamageTypeId: number,
    weaponTierTypeHash?: number
  ) {
    this.name = name;
    this.powerCapValues = powerCapValues;
    this.itemCategoryHashes = itemCategoryHashes;
    this.weaponDamageTypeId = weaponDamageTypeId;
    this.weaponTierTypeHash = weaponTierTypeHash;
  }
}
