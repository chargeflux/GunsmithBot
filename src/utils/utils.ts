import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import fuzzysort from "fuzzysort";
import { WeaponBase, WeaponClass } from "../models/constants";
import { BaseMetadata } from "../models/destiny-entities/base-metadata";
import { Weapon } from "../models/destiny-entities/weapon";

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function orderResultsByName<k extends BaseMetadata>(query: string, metadata: k[]) {
  const results = fuzzysort.go(query, metadata, {
    allowTypo: false,
    key: "name",
  });

  return results.map((x) => x.obj);
}

export function orderResultsByRandomOrTierType(weaponResults: Weapon[]): Weapon[] {
  const weapons: Weapon[] = [];
  const names: string[] = weaponResults.map((x) => x.name);
  for (const weapon of weaponResults) {
    if (weapon.baseArchetype) {
      if (weapon.hasRandomRolls || weapon.baseArchetype.rarity == "Exotic") {
        const idx: number = names.indexOf(weapon.name);
        if (idx > -1) weapons.splice(idx, 0, weapon);
      } else weapons.push(weapon);
    }
  }
  return weapons;
}

export function validateWeaponSearch(rawWeaponData: DestinyInventoryItemDefinition): boolean {
  const categoryHashes = rawWeaponData.itemCategoryHashes ?? [];
  if (!categoryHashes.includes(WeaponBase.Weapon)) return false;
  if (categoryHashes.includes(WeaponClass.Dummy)) return false;
  if (!rawWeaponData.sockets) return false;
  return true;
}
