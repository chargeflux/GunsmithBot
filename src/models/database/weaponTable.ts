import { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { WeaponTable } from "../../services/weaponDbService";

export interface DestinyInventoryItemDefinitionRecord {
  hash: string;
  name?: string;
  data: DestinyInventoryItemDefinition;
}

export type WeaponDBTables = Record<WeaponTable, PerkWeaponHashMap | undefined>;

export type PerkWeaponHashMap = {
  [hash: string]: [name: string, weaponHashes: Set<string>];
};

export type PerkRecord = {
  name: string;
  weaponHash: string;
};
