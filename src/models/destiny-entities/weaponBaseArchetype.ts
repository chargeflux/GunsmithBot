import { logger } from "../../logger";
import { DamageType, MAX_POWER_LEVEL, WeaponBase, WeaponClass, TierType } from "../constants";
import { BaseDestinyItem } from "./baseMetadata";
import Perk from "./perk";

const _logger = logger.getChildLogger({ name: "WeaponBaseArchetype" });

export class WeaponBaseArchetype implements BaseDestinyItem {
  readonly name: string;
  readonly type: keyof typeof WeaponBase;
  readonly class: keyof typeof WeaponClass;
  readonly rarity: keyof typeof TierType;
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
    weaponClass: keyof typeof WeaponClass,
    weaponTierType: keyof typeof TierType,
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

  static create(data: WeaponArchetypeData, intrinsic?: Perk): WeaponBaseArchetype {
    let weaponBase: keyof typeof WeaponBase | undefined;
    let weaponClass: keyof typeof WeaponClass | undefined;
    let weaponTierType: keyof typeof TierType | undefined;
    let isKinetic = false;
    for (const hash of data.itemCategoryHashes.sort().slice(1)) {
      const category = WeaponBase[hash] as keyof typeof WeaponBase | undefined;
      if (category) {
        weaponBase = category;
        isKinetic = hash == WeaponBase.Kinetic;
      } else {
        const category = WeaponClass[hash] as keyof typeof WeaponClass | undefined;
        if (category) {
          weaponClass = category;
        }
      }
    }
    if (!weaponBase) throw Error("Failed to parse weapon base class");
    if (!weaponClass) {
      if (data.itemTypeDisplayName == "Glaive") {
        weaponClass = "Glaive";
        _logger.warn("Glaive has no item category hash yet");
      } else {
        throw Error("Failed to parse weapon class");
      }
    }

    const tierTypeHash = data.weaponTierTypeHash;
    if (tierTypeHash) weaponTierType = TierType[tierTypeHash] as keyof typeof TierType | undefined;
    else throw Error("Weapon tier type hash is invalid");
    if (!weaponTierType) throw Error(`Failed to parse tier type hash ${tierTypeHash}`);

    const weaponDamageTypeId = data.weaponDamageTypeId;
    const damageType = DamageType[weaponDamageTypeId] as keyof typeof DamageType | undefined;
    if (!damageType) throw Error(`Failed to parse damage type hash ${weaponDamageTypeId}`);

    const baseArchetype = new WeaponBaseArchetype(
      data.name,
      weaponBase,
      weaponClass,
      weaponTierType,
      damageType,
      isKinetic,
      intrinsic
    );

    if (data.powerCapValues) baseArchetype.powerCap = Math.max(...data.powerCapValues);
    else throw Error("Failed to set power cap values");

    return baseArchetype;
  }

  toString() {
    let stringToConstruct = "";
    if (!this.isKinetic || this.damage == "Stasis") stringToConstruct += this.damage + " ";
    stringToConstruct += this.type;
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
  itemTypeDisplayName: string; // FIXME: Glaive has no ItemCategoryHash

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
