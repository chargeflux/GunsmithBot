import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import fuzzysort from "fuzzysort";
import { WeaponSlot, WeaponClass, WEAPON_CATEGORY_HASH } from "../models/constants";
import { BaseMetadata } from "../models/destiny-entities/baseMetadata";

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

export function validateWeaponSearch(rawWeaponData: DestinyInventoryItemDefinition): boolean {
  const categoryHashes = rawWeaponData.itemCategoryHashes ?? [];
  if (!categoryHashes.includes(WEAPON_CATEGORY_HASH)) return false;
  if (categoryHashes.includes(WeaponClass.Dummy)) return false;
  if (!rawWeaponData.sockets) return false;
  return true;
}
