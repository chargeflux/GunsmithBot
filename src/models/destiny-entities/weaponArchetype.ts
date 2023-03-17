import { DamageType, MAX_POWER_LEVEL, WeaponSlot, WeaponClass, TierType } from "../constants";
import { BaseDestinyItem } from "./baseMetadata";
import Perk from "./perk";

export class WeaponArchetype implements BaseDestinyItem {
  readonly name: string;
  readonly slot: keyof typeof WeaponSlot;
  readonly class: keyof typeof WeaponClass;
  readonly rarity: keyof typeof TierType;
  readonly damage: keyof typeof DamageType;
  readonly intrinsic?: Perk;
  readonly isKinetic: boolean;
  readonly isDarkness: boolean;
  private _powerCap?: number;

  public set powerCap(value: number) {
    if (value != MAX_POWER_LEVEL) this._powerCap = value;
  }

  public get powerCap(): number {
    return this._powerCap ?? 0;
  }

  private constructor(
    name: string,
    weaponSlot: keyof typeof WeaponSlot,
    weaponClass: keyof typeof WeaponClass,
    weaponTierType: keyof typeof TierType,
    weaponDamageType: keyof typeof DamageType,
    isKinetic: boolean,
    intrinsic?: Perk
  ) {
    this.name = name;
    this.slot = weaponSlot;
    this.class = weaponClass;
    this.rarity = weaponTierType;
    this.damage = weaponDamageType;
    this.isKinetic = isKinetic;
    this.isDarkness = weaponDamageType == "Stasis" || weaponDamageType == "Strand";
    this.intrinsic = intrinsic;
  }

  static create(data: WeaponArchetypeData, intrinsic?: Perk): WeaponArchetype {
    let weaponSlot: keyof typeof WeaponSlot | undefined;
    let weaponClass: keyof typeof WeaponClass | undefined;
    let weaponTierType: keyof typeof TierType | undefined;
    let isKinetic = false;
    for (const hash of data.itemCategoryHashes.sort().slice(1)) {
      const category = WeaponSlot[hash] as keyof typeof WeaponSlot | undefined;
      if (category) {
        weaponSlot = category;
        isKinetic = hash == WeaponSlot.Kinetic;
      } else {
        const category = WeaponClass[hash] as keyof typeof WeaponClass | undefined;
        if (category) {
          weaponClass = category;
        }
      }
    }
    if (!weaponSlot) throw Error("Failed to parse weapon slot");
    if (!weaponClass) throw Error("Failed to parse weapon class");

    const tierTypeHash = data.weaponTierTypeHash;
    if (tierTypeHash) {
      weaponTierType = TierType[tierTypeHash] as keyof typeof TierType | undefined;
    } else throw Error("Weapon tier type hash is invalid");
    if (!weaponTierType) throw Error(`Failed to parse tier type hash ${tierTypeHash}`);

    const weaponDamageTypeId = data.weaponDamageTypeId;
    const damageType = DamageType[weaponDamageTypeId] as keyof typeof DamageType | undefined;
    if (!damageType) throw Error(`Failed to parse damage type hash ${weaponDamageTypeId}`);

    const archetype = new WeaponArchetype(
      data.name,
      weaponSlot,
      weaponClass,
      weaponTierType,
      damageType,
      isKinetic,
      intrinsic
    );

    if (data.powerCapValues) archetype.powerCap = Math.max(...data.powerCapValues);
    else throw Error("Failed to set power cap values");

    return archetype;
  }

  toString() {
    let stringToConstruct = "";
    if (!this.isKinetic || this.isDarkness) stringToConstruct += this.damage + " ";
    stringToConstruct += this.slot;
    stringToConstruct += " " + this.class;
    if (this.powerCap) stringToConstruct += " (" + this.powerCap.toString() + ")";

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
  itemTypeDisplayName: string;

  constructor(
    name: string,
    powerCapValues: number[],
    itemCategoryHashes: number[],
    weaponDamageTypeId: number,
    itemTypeDisplayName: string,
    weaponTierTypeHash?: number
  ) {
    this.name = name;
    this.powerCapValues = powerCapValues;
    this.itemCategoryHashes = itemCategoryHashes;
    this.weaponDamageTypeId = weaponDamageTypeId;
    this.weaponTierTypeHash = weaponTierTypeHash;
    this.itemTypeDisplayName = itemTypeDisplayName;
  }
}
